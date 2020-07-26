import React, { useState } from "react";
import { Link } from "react-router-dom";
import TypologyService from "../../services/TypologyService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from "react-moment";

export default ({ typology }) => {
  const [isApproving, setIsApproving] = useState(false);
  
  const updateVulnerabilityStatus = async (riskScenario, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await TypologyService.updateVulnerabilityStatus(
        typology?.id,
        riskScenario?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut du la vulnérabilité à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set riskScenario status
      riskScenario.status = status;
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
    <div id="vulnerabilities_wrapper" className="dataTables_wrapper dt-bootstrap4">
      <div className="row">
        <div className="col-sm-12">
          <table
            id="vulnerabilities"
            className="table table-bordered table-striped dataTable dtr-inline"
            role="grid"
            aria-describedby="vulnerabilities_info"
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
              {typology?.vulnerabilities?.map((vulnerability, key) => (
                <tr
                  role="row"
                  key={key}
                  className={key % 2 === 0 ? "odd" : "even"}
                >
                  <td>
                    <Link to={`/vulnerabilities/${vulnerability?.id}`}>{vulnerability?.name || ""}</Link>
                  </td>
                  <td dangerouslySetInnerHTML={{
                                __html: `${vulnerability?.description?.slice(
                                  0,
                                  20
                                ) || ""} ${
                                    vulnerability?.description?.length > 20 ? "..." : ""
                                }`,
                              }}></td>
                  <td>
                    <div className="text-center">
                      {vulnerability?.status ? "APPROUVÉ" : "REJETÉ"}
                      <button
                        onClick={(event) =>
                            updateVulnerabilityStatus(vulnerability, !vulnerability?.status)
                        }
                        className={`ml-2 btn btn-${
                            vulnerability?.status ? "danger" : "success"
                        } btn-sm ${isApproving ? "disabled" : ""}`}
                      >
                        <FontAwesomeIcon
                          icon={
                            vulnerability?.status ? "minus-circle" : "check-circle"
                          }
                          color="white"
                        />
                        {vulnerability?.status ? " Rejecter" : " Approuver"}
                      </button>
                    </div>
                  </td>
                  <td>
                    <Moment format="YYYY/MM/DD HH:MM:SS">
                      {vulnerability?.identificationDate}
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
