# tad-db.js
A server (powered by Express) to interface with Discord as a database.
Used for the sshmail project

## Interface
You have to make your own client
call `http://83.212.127.188:8080/?key=RSA_PUBLIC_KEY` to fetch messages that were sent to that address
call `http://83.212.127.188:8080/?to=RSA_RECIPIENT_PUBLIC_KEY&msg=BASE64_ENCODED` to send a message to that address

Signing and authoring is not (and will not be) supported. Messaging is completely anonymous. It is also public, since anyone can read anyone else's inbox, provided they know their public address.

Usually you'd want to encrypt your messages with RSA (or otherwise), then possibly also sign them, if the recipient has your public address. The recipient must also be aware of the method you use to encrypt and sign messages, since their client must support it.

Messages are limited to 2kB and must be base64 encoded.  
Don't forget to url-encode your public key.
