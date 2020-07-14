import React from 'react';

export default () => {

    return (
        <footer className="p-1 text-dark" style={{backgroundColor: '#f1f2f3', fontFamily: '-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,Fira Sans,Droid Sans,Helvetica Neue,sans-serif'}}>
            <div className="container text-center mt-3">
                <p>Tous les droits sont réservés &copy; {new Date().getFullYear()}</p>
            </div>
        </footer>
    );

}