import os
import json
import re

# Configuration
REPOROOT = "../../"  # Root of the repository relative to this script
CATEGORIES_FILE = "categories.json"
EXCLUDED_FOLDERS = {'.git', 'docs', '.vscode', '__pycache__', '.venv', 'Randoms', 'Design Reference'}
EXTENSIONS = {'.EXMODZ', '_P.pak'}
PLACEHOLDER_COLOR = "#000000"
PLACEHOLDER_ICON = "fa-shield-halved"
PLACEHOLDER_DESC = "System Alert: Initializing category metadata. Configuration required."

def format_name(folder_name):
    """Converts folder name like 'Stack_Mods' or 'WeightMods' to 'Stack Mods'"""
    # Replace underscores with spaces
    name = folder_name.replace('_', ' ')
    # Add spaces before capital letters (CamelCase to Space Case)
    name = re.sub(r'(?<!^)(?=[A-Z])', ' ', name)
    # Remove extra spaces and return
    return name.strip()

def has_mod_files(path):
    """Recursively checks if a folder or its subfolders contain mod files."""
    for root, dirs, files in os.walk(path):
        for file in files:
            if any(file.endswith(ext) for ext in EXTENSIONS):
                return True
    return False

def sync_categories():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, CATEGORIES_FILE)
    repo_root_path = os.path.abspath(os.path.join(script_dir, REPOROOT))
    
    # Load existing categories
    if os.path.exists(json_path):
        with open(json_path, 'r') as f:
            data = json.load(f)
            # Handle both nested and direct structures
            categories = data.get('Categories', data)
    else:
        categories = {}
        data = {"Categories": categories}

    print(f"--- Icarus Mod Categories Sync ---")
    print(f"Scanning Root: {repo_root_path}")
    
    found_folders = set()
    
    # scan for valid folders in repo root
    for folder in os.listdir(repo_root_path):
        folder_path = os.path.join(repo_root_path, folder)
        if os.path.isdir(folder_path) and folder not in EXCLUDED_FOLDERS:
            if has_mod_files(folder_path):
                found_folders.add(folder)
                print(f"Detected Valid Category folder: {folder}")

    # Add new folders to JSON
    changed = False
    for folder in found_folders:
        # Use folder as key
        if folder not in categories:
            print(f"Adding NEW category: {folder}")
            categories[folder] = {
                "Name": format_name(folder),
                "Description": PLACEHOLDER_DESC,
                "Color": PLACEHOLDER_COLOR,
                "Icon": PLACEHOLDER_ICON,
                "Folder": folder
            }
            changed = True
    
    # Optional: Remove categories that no longer exist on disk
    keys_to_remove = [k for k in categories if categories[k].get('Folder') not in found_folders and categories[k].get('Folder') is not None]
    for k in keys_to_remove:
        # Only remove if they pointing to a folder that is gone
        print(f"Removing OBSOLETE category: {k}")
        del categories[k]
        changed = True

    if changed:
        # Ensure we maintain the structure
        final_data = {"Categories": categories} if 'Categories' in data else categories
        with open(json_path, 'w') as f:
            json.dump(final_data, f, indent=4)
        print(">>> categories.json updated!")
    else:
        print(">>> No changes needed for categories.json")

if __name__ == "__main__":
    sync_categories()
