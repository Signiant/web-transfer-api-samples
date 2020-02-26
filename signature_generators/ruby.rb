# requires https://github.com/jwt/ruby-jwt
# Install it via
# sudo gem install jwt

require 'jwt'

# Fill in the following variables

apiKey = "" #from https://manage.signiant.com (click on Keys)
secret = "" #from https://manage.signiant.com (click on Keys and generate a secret)
config = "" #from https://manage.signiant.com (click on Storage)

# You shouldn't have to modify anything below this line

fivemins = Time.now + 5*60

payload = {:iss => apiKey, :cfg => config, :aud => 'signiant_flight_console', :iat => Time.now.to_i, :exp => fivemins.to_i}

token = JWT.encode payload, secret, 'HS256'

#comment out the following line to return token instead
puts token
