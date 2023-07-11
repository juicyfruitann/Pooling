import { check } from "k6";
import http from "k6/http";

import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";

export function getTokens(host, userCount = 2) {
  let response;
  const userEmailPrefix = "a.shakinko+100LT";

  // Создадим пользователей от админа (если пользователь уже есть, то скипнется)
  response = http.put(host + "api/identity/login",
    '{"username":"admin@devlogics.ru","password":"admin"}',
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json; charset=UTF-8",
      },
    }
  );
  const adminAccessToken = jsonpath.query(response.json(), "$.accessToken")[0];
  let tokens = [];

  for (let index = 0; index < userCount; index++) {
    response = http.get(host + "api/companies/list",
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${adminAccessToken}`,
        },
      });

    let randomCompany = randomIntBetween(0, Object.keys(response.json()).length - 1);
    let randomCompanyId = jsonpath.query(response.json(), "$[" + randomCompany + "].id")[0];
    let randomCompanyType = jsonpath.query(response.json(), "$[" + randomCompany + "].type")[0];

    response = http.post(host + "api/users",
      `{"id":null,"name":"${userEmailPrefix}${index}","type":"","companyId":"${randomCompanyId}","email":"${userEmailPrefix}${index}@artlogics.ru","phoneNumber":"+7930340300","password":"a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=","permissions":[],"role":"${randomCompanyType}","error":null}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${adminAccessToken}`,
          "content-type": "application/json; charset=UTF-8",
        },
      }
    );

    // Соберем токены для пользователей
    response = http.put(host + "api/identity/login",
      `{"username":"${userEmailPrefix}${index}@artlogics.ru","password":"1"}`,
      {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json; charset=UTF-8",
        },
      }
    );
    check(response, {
      "tokens generate with status 200": (r) => r.status === 200,
    });
    tokens.push(jsonpath.query(response.json(), "$.accessToken")[0]);
  }
  return tokens;
}