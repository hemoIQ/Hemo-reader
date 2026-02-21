import os
import glob

# Configuration
CMAP_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "libs", "cmaps")

# Prefixes of files to DELETE (Asian languages)
DELETE_PREFIXES = [
    # Adobe-defined CJK collections
    "Adobe-CNS1", "Adobe-GB1", "Adobe-Japan1", "Adobe-Korea1",
    # Universal (Unicode) CJK mappings
    "UniCNS", "UniGB", "UniJIS", "UniKS",
    # Legacy Encodings (Chinese, Japanese, Korean)
    "CNS", "GB", "B5", "HK", "KSC", "EUC", "RKSJ",
    "78", "83pv", "90ms", "90pv", "90msp", "Add", "Ext", "NWP",
    "Katakana", "Hiragana", "Hankaku", "H.bcmap", "V.bcmap",
    "ETHK", "ETen", "ETenms" 
    # Note: H.bcmap/V.bcmap usually map to Shift-JIS or similar in this context if Identity-H is absent
]

# Files/Prefixes to explicitly KEEP (if any match the above, which they shouldn't)
KEEP_PREFIXES = [
    "Identity-H", "Identity-V",
    "Roman", "WP-Symbol", "LICENSE"
]

def main():
    if not os.path.exists(CMAP_DIR):
        print(f"Directory not found: {CMAP_DIR}")
        return

    files = os.listdir(CMAP_DIR)
    to_delete = []

    print(f"Target Directory: {CMAP_DIR}")
    print("Identifying files to delete...")
    
    for f in files:
        if not os.path.isfile(os.path.join(CMAP_DIR, f)):
            continue
            
        should_delete = False
        
        # Check against delete prefixes (or full match)
        for prefix in DELETE_PREFIXES:
            # Handle exact matches for short names like 'H.bcmap' to avoid accidental prefix match if any
            if f.startswith(prefix):
                 should_delete = True
                 break

        # Safety: Check against keep list (overrides delete)
        for keep in KEEP_PREFIXES:
            if f.startswith(keep):
                should_delete = False
                break
        
        if should_delete:
            to_delete.append(f)

    if len(to_delete) == 0:
        print("No unnecessary Asian CMap files found.")
        return

    print(f"Found {len(to_delete)} files to delete.")
    print("First 10 files to delete:")
    for f in to_delete[:10]:
        print(f" - {f}")
    if len(to_delete) > 10:
        print(f" ... and {len(to_delete) - 10} more.")

    confirm = input("Are you sure you want to delete these files? (yes/no): ")
    if confirm.lower() == 'yes':
        deleted_count = 0
        for f in to_delete:
            filepath = os.path.join(CMAP_DIR, f)
            try:
                os.remove(filepath)
                deleted_count += 1
            except Exception as e:
                print(f"Failed to delete {f}: {e}")
        print(f"Successfully deleted {deleted_count} files.")
    else:
        print("Operation cancelled. No files were deleted.")

if __name__ == "__main__":
    main()
