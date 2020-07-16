import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import UserService from "../services/UserService";

export default () => {

    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    // User Id Extraction from URL
    let {id} = useParams();
    let active = true;

    useEffect(() => {
        fetchUser();
        return () => {
            active = false;
        }
    }, [])

    const fetchUser = async () => {
        try {
            const user = await UserService.getUser(id);
            if( active ) {
                setUser(user);
                setLoading(false);
                setError(false);
            } 
            console.log(user === "");
        } catch(e) {
            console.log(e);
            if( active ) {
                setLoading(true);
                setError(true);
                setUser(null)
            }
        }
    }


  return (
      <div>
          {JSON.stringify(user)}
      </div>
  )
};
