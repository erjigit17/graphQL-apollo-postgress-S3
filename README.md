# volt_test_task
тестовое задание на позицию бекэнд разработчика 

# регистрация ползователя 
пример: POST http://127.0.0.1:3000/graphql
```js
// Operation
  `mutation Mutation($data: UserCreateInput!) {
  signupUser(data: $data) {
    token
  }
}`
// Variables
  `{
  "data": {
    "email": "user@mail.com",
    "password": "123",
    "nickname": "user"
  }
}`
```
в ответ получите JWT токен на 24 часа
для постоянного использования токена нужно в хейдара прописать 
Connection settings -> Default headers -> Authorization + токен

# логин
```js
// Operation
`mutation Mutation($data: UserLoginInput!) {
  loginUser(data: $data) {
    token
  }
}`
// Variables
  `{
  "data": {
    "email": "user@mail.com",
    "password": "123"
  }
}`
```
в ответ получите JWT токен на 24 часа

# создание поста
```js
// Operation
`mutation Mutation($title: String!, $body: String!, $publishedAt: String) {
  createPost(title: $title, body: $body, published_at: $publishedAt) {
    id
    title
    body
    published_at
    authorsNickname
  }
}`
// Variables
  `{
  "title": "Amazing GraphQL",
  "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam egestas, massa vitae sollicitudin tincidunt, diam quam congue elit, ac tristique eros purus non tortor. Cras vel rutrum purus. Aliquam maximus pulvinar enim nec venenatis. Suspendisse condimentum dictum ante, cursus dapibus nibh gravida in. Sed dignissim massa ut justo convallis venenatis. Quisque molestie risus nec efficitur aliquet. Mauris malesuada tincidunt massa, vel viverra nisi imperdiet sed. Sed laoreet posuere leo, vitae iaculis arcu volutpat id. Vestibulum mollis imperdiet blandit. Donec metus elit, sodales vel consequat et, consectetur nec enim. Donec aliquet iaculis erat. Aliquam vestibulum massa tortor. Nunc sit amet mi vel lorem molestie venenatis quis ut neque.",
  "publishedAt": null
}`


```



# загрузка файлов
Altair Graphql client

Query
```js
`mutation Mutation($file: Upload!) {
  singleUpload(file: $file) {
    filename
    mimetype
    encoding
  }
}`
```
VARIABLES -> Add files

