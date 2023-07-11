import { check } from "k6";
import http from "k6/http";

import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";
import { randomIntBetween } from "https://jslib.k6.io/k6-utils/1.1.0/index.js";
import { getTokens } from "./token.js";

const host = "https://test5.pooling.artlogics.ru/";

export const options = {
  thresholds: {
    "iteration_duration{scenario:warehouse}": [`max>=0`],
    "iteration_duration{scenario:kladr}": [`max>=0`],
    "iteration_duration{group:::setup}": [`max>=0`],
    "http_req_duration{scenario:warehouse}": [`max>=0`],
    "http_req_duration{scenario:kladr}": [`max>=0`],
    "http_req_duration{group:::setup}": [`max>=0`],
    "http_req_failed{scenario:warehouse}": [`rate>=0`],
    "http_req_failed{scenario:kladr}": [`rate>=0`],
    "http_req_failed{group:::setup}": [`rate>=0`],
  },
  scenarios: {
    warehouse: {
      executor: "ramping-arrival-rate",
      startTime: "5s",
      startRate: 50,
      timeUnit: "1s",
      stages: [
        { target: 50, duration: "10m" },
        //  { target: 30, duration: "3m" },
        //  { target: 50, duration: "1m" },
      ],
      preAllocatedVUs: 20,
      maxVUs: 500,
      exec: 'warehouse',
    },
    kladr: {
      executor: "ramping-arrival-rate",
      startTime: "5s",
      startRate: 10,
      timeUnit: "1s",
      stages: [
        { target: 10, duration: "10m" },
        { target: 20, duration: "3m" },
        { target: 30, duration: "1m" },
      ],
      preAllocatedVUs: 20,
      maxVUs: 500,
      exec: 'kladr',
    },
  },
};

export function setup() {
  let response = http.put(host + "api/identity/login",
    '{"username":"admin@devlogics.ru","password":"admin"}',
    {
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json; charset=UTF-8",
      },
    }
  );
  const adminAccessToken = jsonpath.query(response.json(), "$.accessToken")[0];
  return adminAccessToken;

  //return getTokens(host, 2);
}

export function kladr(data) {
  let response = http.get(
    host + `api/helper?departureDate=2022-02-22&deliveryDate=2022-02-24&productType=NonFood&carTypes=Tent&carTypes=Ref&carTypes=Isotherm&pallets=3&weight=1950&kladrFrom=50042000148005900&kladrTo=4701800056400060001&consignorId=5bb3a65a6458d524784dd409&shippingRegionIds=5bf87204dc28430b4422a7f9&priorityDates=Loading&shippingTypes=FTL&shippingTypes=LTL&shippingTypes=Pooling&temperaturesFrom=-18&temperaturesFrom=2&temperaturesFrom=5&temperatureTo=-18&temperatureTo=6&temperatureTo=25&shippingMethod=AllSelected&priceType=AllSelected&skip=0&take=10&debug=false`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${data}`,
      },
    }
  );
  check(response, {
    "is status 200": (r) => r.status === 200,
    'total count >= 14': (r) => jsonpath.query(response.json(), "$.totalCount")[0] >= 14,
  });
}

export function warehouse(data) {
  let response = http.get(
    host + `api/helper?departureDate=2022-02-22&deliveryDate=2022-02-24&productType=NonFood&carTypes=Tent&carTypes=Ref&carTypes=Isotherm&pallets=3&weight=1950&warehouseFrom=5bb3a7856458d524784dd40c&warehouseTo=5b23dfcccd1a2640b4de30d3&consignorId=5bb3a65a6458d524784dd409&shippingRegionIds=5bf87204dc28430b4422a7f9&priorityDates=Loading&shippingTypes=FTL&shippingTypes=LTL&shippingTypes=Pooling&temperaturesFrom=-18&temperaturesFrom=2&temperaturesFrom=5&temperatureTo=-18&temperatureTo=6&temperatureTo=25&shippingMethod=AllSelected&priceType=AllSelected&skip=0&take=10&debug=false`,
    {
      headers: {
        accept: "application/json, text/plain, */*",
        authorization: `Bearer ${data}`,
        //data[Math.floor(Math.random() * data.length)]
      },
    }
  );
  check(response, {
    "is status 200": (r) => r.status === 200,
    'total count >= 40': (r) => jsonpath.query(response.json(), "$.totalCount")[0] >= 40,
  });
}