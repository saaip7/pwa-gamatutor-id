from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from models.attachment_model import Attachment
from utils.auth import get_user_id_from_token
from config import Config

attachments_bp = Blueprint('attachments', __name__)

@attachments_bp.route('/api/attachments/card/<card_id>', methods=['GET'])
def get_card_attachments(card_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get attachments for the card
        attachments = Attachment.get_attachments_by_card_id(card_id)
        return jsonify(attachments)
    except Exception as e:
        print(f"Error fetching attachments: {str(e)}")
        return jsonify({"error": str(e)}), 500

@attachments_bp.route('/api/attachments/upload', methods=['POST'])
def upload_attachment():
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get file and metadata from request
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400

        board_id = request.form.get('board_id')
        card_id = request.form.get('card_id')

        if not board_id or not card_id:
            return jsonify({"error": "Missing board_id or card_id"}), 400

        # Create secure filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        original_filename = secure_filename(file.filename)
        filename = f"{timestamp}_{original_filename}"

        # Create directory structure
        user_dir = os.path.join(Config.UPLOAD_FOLDER, str(user_id))
        board_dir = os.path.join(user_dir, str(board_id))
        card_dir = os.path.join(board_dir, str(card_id))
        
        os.makedirs(card_dir, exist_ok=True)
        file_path = os.path.join(card_dir, filename)

        # Save file
        file.save(file_path)

        # Create attachment record
        attachment = Attachment.create_attachment(
            user_id=user_id,
            board_id=board_id,
            card_id=card_id,
            file_path=file_path,
            original_filename=original_filename
        )

        return jsonify(attachment), 201
    except Exception as e:
        print(f"Error uploading file: {str(e)}")
        return jsonify({"error": str(e)}), 500

@attachments_bp.route('/api/attachments/download/<attachment_id>', methods=['GET'])
def download_attachment(attachment_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get attachment
        attachment = Attachment.get_attachment_by_id(attachment_id)
        if not attachment:
            return jsonify({"error": "Attachment not found"}), 404

        # Check if user owns the attachment
        if str(attachment['user_id']) != str(user_id):
            return jsonify({"error": "Unauthorized"}), 403

        # Check if file exists
        if not os.path.exists(attachment['file_path']):
            return jsonify({"error": "File not found"}), 404

        return send_file(
            attachment['file_path'],
            as_attachment=True,
            download_name=attachment['original_filename']
        )
    except Exception as e:
        print(f"Error downloading file: {str(e)}")
        return jsonify({"error": str(e)}), 500

@attachments_bp.route('/api/attachments/<attachment_id>', methods=['DELETE'])
def delete_attachment(attachment_id):
    try:
        # Get token from header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({"error": "No authorization header"}), 401

        # Get user_id from token
        user_id = get_user_id_from_token(auth_header)
        if not user_id:
            return jsonify({"error": "Invalid token"}), 401

        # Get attachment
        attachment = Attachment.get_attachment_by_id(attachment_id)
        if not attachment:
            return jsonify({"error": "Attachment not found"}), 404

        # Check if user owns the attachment
        if str(attachment['user_id']) != str(user_id):
            return jsonify({"error": "Unauthorized"}), 403

        # Delete file
        if os.path.exists(attachment['file_path']):
            os.remove(attachment['file_path'])

        # Delete attachment record
        Attachment.delete_attachment(attachment_id)

        return jsonify({"message": "Attachment deleted successfully"}), 200
    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        return jsonify({"error": str(e)}), 500 