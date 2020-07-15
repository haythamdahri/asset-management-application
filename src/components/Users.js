import React, { Component, useState, useEffect } from "react";
import UserService from "../services/UserService";

export default () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [users, setUsers] = useState([]);
  let active = true;

  useEffect(() => {
    fetchUsers();
    return () => {
      active = false;
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const users = await UserService.getUsers();
      if (active) {
        setLoading(false);
        setUsers(users);
        setError(false);
      }
    } catch (e) {
      if (active) {
        setLoading(false);
        setError(true);
        setUsers(null);
      }
    }
  };

  return (
    <div className="content-wrapper">
      <div className="col-12 text-center"></div>
      <div>{JSON.stringify(users)}</div>
    </div>
  );
};
