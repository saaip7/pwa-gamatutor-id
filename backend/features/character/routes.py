from flask import Blueprint
from features.character.controller import get_character, equip

character_bp = Blueprint("character_bp", __name__)

character_bp.route("/api/character", methods=["GET"])(get_character)
character_bp.route("/api/character/equip", methods=["PUT"])(equip)
