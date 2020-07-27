import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import TypologyService from "../../services/TypologyService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from "react-moment";

export default ({ typology }) => {
  const [isApproving, setIsApproving] = useState(false);

  const updateThreatStatus = async (threat, status) => {
      console.log(threat);
      console.log(status);
    // Perform User delete
    try {
      setIsApproving(true);
      await TypologyService.updateThreatStatus(
        typology?.id,
        threat?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de la menace à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set threat status
      threat.status = status;
    } catch (err) {
      Swal.fire(
        "Erreur!",
        err?.response?.data?.message ||
          `Une erreur est survenue, veuillez ressayer!`,
        "error"
      );
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div id="threats_wrapper" className="dataTables_wrapper dt-bootstrap4">
      <div className="row">
        <div className="col-sm-12">
          <table
            id="example2"
            className="table table-bordered table-striped dataTable dtr-inline"
            role="grid"
            aria-describedby="threats_info"
          >
            <thead align="center">
              <tr role="row">
                <th>Nom</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Date d'identification</th>
              </tr>
            </thead>
            <tbody align="center">
              {typology?.threats?.map((threat, key) => (
                <tr
                  role="row"
                  key={key}
                  className={key % 2 === 0 ? "odd" : "even"}
                >
                  <td>
                    <Link to={`/threats/view/${typology?.id}/${threat?.id}`}>{threat?.name || ""}</Link>
                  </td>
                  <td dangerouslySetInnerHTML={{
                                __html: `${threat?.description?.slice(
                                  0,
                                  20
                                ) || ""} ${
                                  threat?.description?.length > 20 ? "..." : ""
                                }`,
                              }}></td>
                  <td>
                    <div className="text-center">
                      {threat?.status ? "APPROUVÉ" : "REJETÉ"}
                      <button
                        onClick={(event) =>
                            updateThreatStatus(threat, !threat?.status)
                        }
                        className={`ml-2 btn btn-${
                          threat?.status ? "danger" : "success"
                        } btn-sm ${isApproving ? "disabled" : ""}`}
                      >
                        <FontAwesomeIcon
                          icon={
                            threat?.status ? "minus-circle" : "check-circle"
                          }
                          color="white"
                        />
                        {threat?.status ? " Rejecter" : " Approuver"}
                      </button>
                    </div>
                  </td>
                  <td>
                    <Moment format="YYYY/MM/DD HH:MM:SS">
                      {threat?.identificationDate}
                    </Moment>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
