import React from "react";
import buildClient from "../api/build-client";
import BaseLayout from "../components/baseLayout";

const LandingPage = ({ currentUser }) => {
  return (
    <BaseLayout currentUser={currentUser}>
      <h1>{currentUser ? "You are signed in" : "You are NOT signed in"}</h1>
    </BaseLayout>
  );
};

/**
 * Using SSR in Kubernetes is different from using SSR outside Kubernetes,
 * because every service has it own world
 * Example, when we come to our website, we make a GET request to ticketing.dev
 * then through our networking host rule that we already set up inside our computer
 * ticketing.dev will become 127:0:0:1, after that the request get into ingress-nginx and follow
 * the routing rule that we set up in ingress-nginx => here it comes to client service (or NextJS app)
 * Inside client service, we using SSR to make a request to 127:0:0:1/api/users/currentuser
 * But the domain 127:0:0:1 here is not the localhost domain in our computer,
 * it is the localhost of the client service itselft, and there is nothing route
 * inside this client service localhost => You will see an error like ECONNREFUSED errors
 * Then to make everything work correctly with SSR in Kubernetes, we need to pass the request to
 * http://ingress-nginx-controller.ingress-nginx.svc.cluster.local (see buildClient)
 * to reach the ingress-nginx again this time is from inside NextJS app, then ingress-nginx
 * will continue pass the request to auth service with our credentials
 * */

export const getServerSideProps = async (context) => {
  const client = buildClient(context);
  const res = await client
    .get("/api/users/currentuser")
    .catch((error) => console.log(error.message));
  return { props: res?.data || { currentUser: null } };
};

export default LandingPage;
