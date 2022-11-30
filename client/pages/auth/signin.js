import React, { useState } from "react";
import Router from "next/router";
import useRequest from "../../hooks/useRequest";
import BaseLayout from "../../components/baseLayout";
import buildClient from "../../api/build-client";

const Signin = ({ currentUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { doRequest, errors } = useRequest({
    url: "/api/users/signin",
    method: "post",
    body: {
      email,
      password,
    },
    onSuccess: () => Router.push("/"),
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    await doRequest();
  };

  return (
    <BaseLayout currentUser={currentUser}>
      <form onSubmit={onSubmit}>
        <h1>Sign in</h1>
        <div className="form-group">
          <label>Email Address</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            className="form-control"
          />
        </div>
        {errors}
        <button className="btn btn-primary">Sign in</button>
      </form>
    </BaseLayout>
  );
};

export const getServerSideProps = async (context) => {
  const client = buildClient(context);
  const res = await client
    .get("/api/users/currentuser")
    .catch((error) => console.log(error));
  return { props: res?.data || { currentUser: null } };
};

export default Signin;
