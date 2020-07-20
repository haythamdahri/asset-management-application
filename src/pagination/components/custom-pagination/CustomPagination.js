import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


export default (props) => {

  const nextPage = () => {
    props.nextPageEvent();
  }

  const previousPage = () => {
    props.previousPageEvent();
  }

  const updatePageSize = (pageSize) => {
    props.pageSizeEvent(pageSize);
  }

  return (
    <div className="card-actions align-items-center d-flex justify-content-center">
        <span className="align-self-center mb-1 mx-1 text-muted">Elements par page:</span>
        <div className="dropdown">
          <button aria-expanded="false" aria-haspopup="true"
            data-toggle="dropdown"
            type="button"
            className={`btn btn-outline dropdown-toggle ${props?.loading ? 'disabled' : ''}`}>
            {props?.page?.size}
          </button>
          <div className="dropdown-menu dropdown-menu-right menu">
            <span style={{cursor: 'pointer'}} className="dropdown-item" onClick={event => updatePageSize(5)}>5</span>
            <span style={{cursor: 'pointer'}} className="dropdown-item" onClick={event => updatePageSize(20)}>20</span>
            <span style={{cursor: 'pointer'}} className="dropdown-item" onClick={event => updatePageSize(100)}>100</span>
          </div>
        </div>
        <span className="align-self-center mb-1 mr-2 text-muted">
          Afichage de {props?.page?.last ? props?.page?.totalElements : (props?.page?.numberOfElements * (props?.page?.number + 1))} sur {props?.page?.totalElements}
        </span>
        <span  
          style={{cursor: 'pointer', 'pointerEvents': `${(props?.page?.first || props?.loading) ? 'none' : ''}`}}
          className={`btn btn-outline ${props?.page?.first || props?.loading ? 'disabled' : ''}`}
          onClick={event => previousPage()}>
          <FontAwesomeIcon icon="angle-double-left" />
        </span>
        <span 
          style={{cursor: 'pointer', 'pointerEvents': `${(props?.page?.last || props?.loading) ? 'none' : ''}`}}
          className={`btn btn-outline ${props?.page?.last || props?.loading ? 'disabled' : ''}`}
          onClick={event => nextPage()}>
          <FontAwesomeIcon icon="angle-double-right" />
        </span>
    </div>
  )
}
