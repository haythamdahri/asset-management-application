import React, { useState } from "react";
import { Link } from "react-router-dom";
import AssetService from "../../services/AssetService";
import Swal from "sweetalert2";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Moment from "react-moment";

export default ({ asset }) => {
  const [isApproving, setIsApproving] = useState(false);

  const updateRiskAnalysisStatus = async (riskAnalysis, status) => {
    // Perform User delete
    try {
      setIsApproving(true);
      await AssetService.updateAssetRiskAnalysisStatus(
        asset?.id,
        riskAnalysis?.id,
        status
      );
      Swal.fire(
        "Operation éffectuée!",
        `Le statut de l'analyse de risque à été ${
          status ? "approuvé" : "rejeté"
        } avec succés!`,
        "success"
      );
      // Set risk analysis status
      riskAnalysis.status = status;
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
    <div
      id="vulnerabilities_wrapper"
      className="dataTables_wrapper dt-bootstrap4"
    >
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
                <th>Actif</th>
                <th>Probabilité</th>
                <th>Impact financier</th>
                <th>Impact financier</th>
                <th>Impact réputationnel</th>
                <th>Statut</th>
                <th>Date d'identification</th>
              </tr>
            </thead>
            <tbody align="center">
              {asset?.riskAnalyzes?.map((riskAnalysis, key) => (
                <tr
                  role="row"
                  key={key}
                  className={key % 2 === 0 ? "odd" : "even"}
                >
                  <td>
                    <Link
                      to={`/riskanalyzes/view/${asset?.id}/${riskAnalysis?.id}`}
                    >
                      {riskAnalysis?.name || ""}
                    </Link>
                  </td>
                  <td>{riskAnalysis?.probability}</td>
                  <td>{riskAnalysis?.financialImpact}</td>
                  <td>{riskAnalysis?.operationalImpact}</td>
                  <td>{riskAnalysis?.reputationalImpact}</td>
                  <td>
                    <div className="text-center">
                      {riskAnalysis?.status ? "APPROUVÉ" : "REJETÉ"}
                      <button
                        onClick={(event) =>
                          updateRiskAnalysisStatus(
                            riskAnalysis,
                            !riskAnalysis?.status
                          )
                        }
                        className={`ml-2 btn btn-${
                          riskAnalysis?.status ? "danger" : "success"
                        } btn-sm ${isApproving ? "disabled" : ""}`}
                      >
                        <FontAwesomeIcon
                          icon={
                            riskAnalysis?.status
                              ? "minus-circle"
                              : "check-circle"
                          }
                          color="white"
                        />
                        {riskAnalysis?.status ? " Rejecter" : " Approuver"}
                      </button>
                    </div>
                  </td>
                  <td>
                    <Moment format="YYYY/MM/DD HH:mm:ss">
                      {riskAnalysis?.identificationDate}
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
