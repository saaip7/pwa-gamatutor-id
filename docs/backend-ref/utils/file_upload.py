import os
from werkzeug.utils import secure_filename
from datetime import datetime

UPLOAD_FOLDER = 'storage'
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_upload_path(user_id: str, board_id: str, card_id: str):
    """Generate the upload path for a file based on user, board, and card IDs"""
    # Create base storage directory if it doesn't exist
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)
    
    # Create the full path
    path = os.path.join(UPLOAD_FOLDER, user_id, board_id, card_id)
    
    # Create the directory structure if it doesn't exist
    if not os.path.exists(path):
        os.makedirs(path)
    
    return path

def save_file(file, user_id: str, board_id: str, card_id: str):
    """Save a file to the appropriate directory"""
    if file and allowed_file(file.filename):
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Add timestamp to filename to prevent collisions
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        
        # Get the upload path
        upload_path = get_upload_path(user_id, board_id, card_id)
        
        # Save the file
        file_path = os.path.join(upload_path, filename)
        file.save(file_path)
        
        # Return the relative path for database storage
        return os.path.join(user_id, board_id, card_id, filename)
    
    return None

def delete_file(file_path: str):
    """Delete a file from storage"""
    full_path = os.path.join(UPLOAD_FOLDER, file_path)
    if os.path.exists(full_path):
        os.remove(full_path)
        return True
    return False

def get_file_path(file_path: str):
    """Get the full file path for a given relative path"""
    return os.path.join(UPLOAD_FOLDER, file_path) 