import React from 'react'
import AuthService from '../services/AuthService';
import RoleType from '../models/RoleType';

export default () => {
    return (
        <div className="row">
            <div className="col-12 text-center">
                <div className="alert alert-success text-center display-4">
                    WELCOME HOME <button onClick={() => AuthService.signout()}></button>
                    <button onClick={() => AuthService.hasAsyncRole(RoleType.ROLE_ACCESSORIES_CHECKIN)}>Check Role</button>
                </div>
            </div>
        </div>
    );
}