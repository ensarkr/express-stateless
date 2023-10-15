# express-stateless

## About
This project comprises a stateless Express backend tailored for single-page React apps. Developed with minimal use of third-party libraries to deepen my understanding, it incorporates JWT authentication and a signed double-submit cookie method to fortify API endpoints against CSRF attacks. Crafted with my current backend knowledge, this project may undergo future updates and improvements as I continue learning.

## Features 
Features parts includes all features and their explanation. Explanations going to be long because I am planning check here when I forget something.  

#### CORS (Cross-Origin-Resource-Sharing)
Express includes its own CORS functions. Which does the most of the work.
 It blocks request that came from non-specified origins. Depending on your options it sets some response headers.
- In this project only sets 2 headers.
> 1. Access-Control-Allow-Origin = http://localhost:5173/ (origin of frontend)
> 2. Access-Control-Allow-Credentials = true
- Second header is used to tell browser to allow response to be seen by javascript.

 While using CORS, to send cookies with the request client must set credential to true. 

#### SameSite Attribute - Cookies

SameSite attribute in cookies used to decide which cookies send with which requests depending on its setter and request domain. It has three option strict, lax and none.

- All cookies use strict option which means only send cookies to domain set these cookies.

#### HttpOnly - Cookies

If it is used it does not allow client javascript access this cookie.

- All cookies use HttpOnly, except jwt_token which javascript needs.

#### Secure - Cookies

If it is used it only allows to send to cookie if request is made with https or it is localhost.

- All cookies use Secure.

#### JWT (JSON Web Tokens)

JWT is used to authorize users in stateless servers. It consist of three parts separated by points, header, payload and signature. These are all base64 coded. Header includes hashing algorithm of JWT which is used by signature part. Payload part include user info and info about JWT. Payload part must not include sensitive user info because everyone decode payload part if they have access to JWT. And signature part is output of hash function created by algorithm which included in the header and a secret key only known by server. Hash functions inputs are base64 coded header+payload. When user logins server creates JWT and its returned in Set-Cookie header. After cookie sets, on client side it always sent with requests. And on server-side its signature checked with rehashing header+payload. If signatures matches server can return responses depending on user info. 

- In this project JWT secret key stored as environment variable.
- Its algorithm is sha256.
- Its cookie is not HttpOnly.

#### Signed Double Submit Cookie (Against CSRF Attacks)

When react component with request actions loads it requests csrf tokens inside an useEffect. And it gets one normal csrf token and one hashed version of this token. And when request made, these csrf tokens send to server and checked if they match by rehashing the normal one.    

- In this project there is two csrf tokens. 
> 1. For guest actions.
> 2. For user actions.
- Which one to get chosen by setting custom header x-csrf-origin to guest or user.
- For guest csrf tokens secret key is stored as environment variable.
- For user csrf tokens secret key is some JWT infos plus environment variable
- Depending on action in the server one of those csrf tokens checked so when react component loads proper csrf must be requested.

- Now if we return to the method. CSRF token requested with POST method which is safer then GET method.
- It returns normal csrf token in set-cookie header. 
- And hashed one is returned inside body of the response.
- When requests are made after getting csrf tokens, normal csrf token send as cookie.
- And hashed one sended as custom header with name of x-csrf-token-hashed-guest(or user).
- If these csrf tokens does not match server responds with error 


## To Run Locally

```
$ npm install
```
After installing project you have to create .env file in the root of the project.
And write your two secrets like example below and save.
>JWT_SECRET_KEY = a8f9fce4-0578-43c5-9241-c658ab014621

>CSRF_SECRET_KEY = cb465a33-c944-4d69-b321-b54c5fe8ea17


```
$ npm start
```
After this backend-server should be accessible on http://localhost:3000/.
You also need to download and serve my react-app project. Here is a [link](https://github.com/ensarkr/react-stateless). 

 
 ## Technologies
 - Express
 - TypeScript
