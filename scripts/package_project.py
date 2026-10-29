import os
import zipfile
import tarfile
import shutil

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PUBLIC_DIR = os.path.join(ROOT_DIR, 'public')
ZIP_OUT = os.path.join(PUBLIC_DIR, 'hps-tools-project.zip')
TAR_OUT = os.path.join(PUBLIC_DIR, 'hps-tools-project.tar.gz')

EXCLUDE_DIRS = {
    'node_modules',
    'dist',
    '.git',
    '.aistudio',
    '__pycache__',
    '.cache',
}

EXCLUDE_FILES = {
    'hps-tools-project.zip',
    'hps-tools-project.tar.gz',
    '.DS_Store',
}

def should_include(rel_path):
    parts = rel_path.split(os.sep)
    for part in parts:
        if part in EXCLUDE_DIRS:
            return False
    filename = os.path.basename(rel_path)
    if filename in EXCLUDE_FILES:
        return False
    if filename.endswith('.pyc'):
        return False
    return True

def build_zip():
    print(f"Creating ZIP archive at {ZIP_OUT}...")
    with zipfile.ZipFile(ZIP_OUT, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(ROOT_DIR):
            # Prune excluded directories in-place
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR)
                if should_include(rel_path):
                    # Store under hps-tools/ root directory in the archive
                    archive_name = os.path.join('hps-tools', rel_path)
                    zipf.write(abs_path, archive_name)
    print(f"ZIP archive created successfully. Size: {os.path.getsize(ZIP_OUT) / 1024:.1f} KB")

def build_tar():
    print(f"Creating TAR.GZ archive at {TAR_OUT}...")
    with tarfile.open(TAR_OUT, 'w:gz') as tarf:
        for root, dirs, files in os.walk(ROOT_DIR):
            dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
            for file in files:
                abs_path = os.path.join(root, file)
                rel_path = os.path.relpath(abs_path, ROOT_DIR)
                if should_include(rel_path):
                    archive_name = os.path.join('hps-tools', rel_path)
                    tarf.add(abs_path, arcname=archive_name)
    print(f"TAR.GZ archive created successfully. Size: {os.path.getsize(TAR_OUT) / 1024:.1f} KB")

if __name__ == '__main__':
    os.makedirs(PUBLIC_DIR, exist_ok=True)
    build_zip()
    build_tar()
    print("Project archives ready for download.")
