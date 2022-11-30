import axios from "axios";

const buildClient = ({ req }) => {
  if (typeof window === "undefined") {
    // We're on the server
    return axios.create({
      baseURL:
        "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local",
      withCredentials: true,
      headers: req.headers,
    });
  } else {
    // We're on the browser
    return axios.create({
      baseURL: "/",
    });
  }
};

export default buildClient;
