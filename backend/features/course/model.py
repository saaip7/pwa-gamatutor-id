from shared.db import mongo
from datetime import datetime


class Course:
    @staticmethod
    def create(course_code, course_name):
        doc = {
            "course_code": course_code,
            "course_name": course_name,
            "created_at": datetime.utcnow(),
        }
        result = mongo.db.courses.insert_one(doc)
        return result.inserted_id

    @staticmethod
    def find_by_code(course_code):
        return mongo.db.courses.find_one({"course_code": course_code})

    @staticmethod
    def find_all():
        return list(mongo.db.courses.find({}))

    @staticmethod
    def update(course_code, updates):
        result = mongo.db.courses.update_one({"course_code": course_code}, {"$set": updates})
        return result

    @staticmethod
    def delete(course_code):
        result = mongo.db.courses.delete_one({"course_code": course_code})
        return result
