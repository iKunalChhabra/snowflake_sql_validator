from flask import Flask, request, jsonify
from snowflake_validator import SnowflakeValidator
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.route('/', methods=['POST'])
def validate():
    query = request.data.decode('utf-8')
    validator = SnowflakeValidator(query)
    response = jsonify(validator.validate())
    return response


if __name__ == '__main__':
    app.run()
