# requires PyJWT
# pip install pyjwt

import jwt
import datetime

# Fill in the following variables

apiKey = "" #from https://manage.signiant.com (click on Keys)
secret = "" #from https://manage.signiant.com (click on Keys and generate a secret)
config = "" #from https://manage.signiant.com (click on Storage)

# You shouldn't have to modify anything below this line

now = datetime.utcnow()
# Usage of UTC is recommended for proper claim settings
fivemins = now + datetime.timedelta(minutes=5)

payload = {
	'iss': apiKey,
	'cfg': config,
	'aud': 'signiant_flight_console',
	'iat': now,
	'exp': fivemins
}

token = jwt.encode(payload, secret, algorithm='HS256')

print token
