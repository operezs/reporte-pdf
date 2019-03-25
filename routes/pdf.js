const express = require('express')
const router = express.Router()
const PDFDocument = require('./pdfkit-tables');
var sql = require("mssql");
var conn = require("../connection/connect")();


router.post('/', (req, res) => {
  const doc = new PDFDocument({
    layout : 'landscape'
  });
  
  let filename = req.body.filename;
  // Stripping special characters
  filename = encodeURIComponent(filename) + '.pdf';
  // Setting response to 'attachment' (download).
  // If you use 'inline' here it will automatically open the PDF
  res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
  res.setHeader('Content-type', 'application/pdf');
  const content = req.body.content;

// These variables are what you must change for the query
  const NOMBRE_EMPRESA = req.body.empresa;
  const JUNT_ID = req.body.junta;
  const FECHA_PODER_INI = `${req.body.fech_In}`
  const FECHA_PODER_FIN = `${req.body.fech_Fin}`

var sqlQueryJunta = ` SELECT  DESCRIPCION
                      FROM dbo.JTA_JUNTAS
                      WHERE JUNT_ID = ${JUNT_ID} `;


var sqlQueryReport = `SELECT  TEMP1.RUT_APODERADO,
                        TEMP1.DV,
                       	TEMP1.APODERADO,
                        TEMP1.RUT_ACCIONISTA,
                        TEMP1.ACCIONISTA,
                       	TEMP1.SERIE,
                        TEMP1.ACCIONES,
                       	TEMP2.TOTAL
                    FROM ( SELECT APO.RUT RUT_APODERADO,
                             	APO.DV DV,
                                  APO.APELLIDO_PATERNO  + SPACE(1)+ APO.APELLIDO_MATERNO  + SPACE(1) + APO.NOMBRE APODERADO,
                                  ACC.RUT RUT_ACCIONISTA,         
                                  isnull(ACC.APELLIDO_PATERNO,' ') + SPACE(1)+ isnull(ACC.APELLIDO_MATERNO ,' ') + SPACE(1) +  ISNULL(ACC.NOMBRE,'')ACCIONISTA,
                              	SERI.DESCRIPCION SERIE,
                                  (CONVERT(MONEY,TIAC.TOTAL_ACCIONES))  ACCIONES         
                           FROM JTA_PODERES PODE,
                                JTA_PERSONAS APO,
                                JTA_PERSONAS ACC,
                                JTA_TITULOS_ACCIONARIOS TIAC,
                                JTA_SERIES SERI         
                           WHERE PODE.JUNT_JUNT_ID = ${JUNT_ID}
                             AND PODE.PERS_PERS_ID = APO.PERS_ID
                             AND PODE.ESTADO = 'V'          
                             AND PODE.PERS_PERS_ID_EMITIDO_POR = ACC.PERS_ID
                             AND PODE.TACC_TACC_ID = TIAC.TACC_ID         
                             AND TIAC.SERI_SERI_ID = SERI.SERI_ID         
                             AND fecha_emision between convert(varchar,'${FECHA_PODER_INI}', 127) and
                                                      convert(varchar,'${FECHA_PODER_FIN}', 127)         
                           GROUP BY APO.RUT,
                                   APO.DV,
                                    APO.APELLIDO_PATERNO +SPACE(1)+ APO.APELLIDO_MATERNO + SPACE(1) + APO.NOMBRE,         
                                    ACC.RUT, isnull(ACC.APELLIDO_PATERNO,' ') + SPACE(1) + isnull(ACC.APELLIDO_MATERNO,' ') + SPACE(1) + ISNULL(ACC.NOMBRE,''),
                                    SERI.DESCRIPCION, (CONVERT(MONEY,TIAC.TOTAL_ACCIONES))) TEMP1,          
                                    (SELECT APO.RUT RUT,
                                            (CONVERT(MONEY, SUM(TIAC.TOTAL_ACCIONES))) TOTAL
                                     FROM JTA_PODERES PODE,
                                          JTA_PERSONAS APO,
                                          JTA_TITULOS_ACCIONARIOS TIAC     
                                     WHERE PODE.JUNT_JUNT_ID = ${JUNT_ID}
                                       AND PODE.PERS_PERS_ID = APO.PERS_ID           
                                       AND PODE.TACC_TACC_ID = TIAC.TACC_ID
                                       AND PODE.ESTADO = 'V'          
                                       AND fecha_emision between convert(varchar,'${FECHA_PODER_INI}', 127) and
                                                                 convert(varchar,'${FECHA_PODER_FIN}', 127)    
                                      GROUP BY APO.RUT ) TEMP2      
                     WHERE TEMP1.RUT_APODERADO = TEMP2.RUT
                       AND temp1.rut_apoderado <> 0
                     `;

 function getJuntas(callback) {
  conn.connect().then(function () {
          var req = new sql.Request(conn);
          req.query(sqlQueryJunta).then(function (recordset) {
                  conn.close();
                  callback(recordset.recordset);
              })
              .catch(function (err) {
                  conn.close();
              });
      })
      .catch(function (err) {
          conn.close();
          console.log("Connection error");
      });
}
function getReport(callback) {
  conn.connect().then(function () {
          var req = new sql.Request(conn);
          req.query(sqlQueryReport).then(function (recordset) {
                  conn.close();
                  callback(recordset.recordset);
              })
              .catch(function (err) {
                  conn.close();
              });
      })
      .catch(function (err) {
          conn.close();
          console.log("Connection error");
      });
}

  
  const table0 = {
    headers: ['NCor', 'RutApod', 'Dv', 'Apoderado', 'Rut_Acc', 'Accionista', 'Serie', 'Acciones', 'Total' ],
    rows: []
  };

  getJuntas(function(junta){
    getReport(function(report){
      const date = new Date();

      var horas= date.getHours();
      var minutos = date.getMinutes();
      var segundos = date.getSeconds();

      var hours = horas + ":" + minutos + ":" + segundos;
      
      const time = `Hora: ${hours}`;
      const fecha = `Fecha: ${date.toLocaleDateString()}`;
      const temp = [];
      var JUNTA = `Junta: ${junta[0].DESCRIPCION}`;
      var EMPRESA = `Empresa: ${NOMBRE_EMPRESA}`

      // Preparing variables to obtain totals
      let acciones = 0;
      let totalAcciones = 0;   
      let apoderados = new Set(); 
      let accionistas = new Set();

      count = 1;
      report.forEach(element => {
        temp.push([ count, element.RUT_APODERADO, element.DV, element.APODERADO, 
                    element.RUT_ACCIONISTA, element.ACCIONISTA, element.SERIE,
                    element.ACCIONES, element.TOTAL]);

        acciones = acciones + element.ACCIONES;
        totalAcciones = totalAcciones + element.TOTAL;  
        if (! apoderados.has(element.APODERADO)) {
            apoderados.add(element.APODERADO);  
            }
        if (! accionistas.has(element.ACCIONISTA)) {
            accionistas.add(element.ACCIONISTA);  
            }

        count ++;
      });

      table0.rows = temp;
  
      // Scale the image
      doc.image('public/images/descarga.jpg', 30, 30, {scale: 0.25})
  
      doc.fontSize(8).text(time, 690, 50, {
        width: 70,
        align: 'right'
      }
      );
      doc.fontSize(8).text(fecha, 690, 60, {
        width: 70,
        align: 'right'
      }
      );
  
      doc.fontSize(8).text(EMPRESA, 30, 80, {
        align: 'left'
      }
      );
  
      doc.fontSize(8).text(JUNTA, 30, 90, {
        align: 'left'
      }
      );
      
      doc.fontSize(12).text(content.toUpperCase(), 300, 80, {
        width: 200,
        align: 'center'
      }
      );
      
      doc.moveDown().table(table0, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
        prepareRow: (row, i) => doc.font('Helvetica').fontSize(6)
      });

      let totalApoderadosInfo = `${apoderados.size}`
      let totalAccionistasInfo = `${accionistas.size}`
      let actionsInfo = `${acciones}`;
      let totalAccionesInfo = `${totalAcciones}`

      doc.font('Helvetica').fontSize(10);
      doc.text('Total de Apoderados: ', 60, 520, { width: 130, align: 'left'});
      doc.text(totalApoderadosInfo, 200, 520, { width: 100, align: 'right'});

      doc.text('Total de Accionistas: ', 60, 530, { width: 130, align: 'left'});
      doc.text(totalAccionistasInfo, 200, 530, { width: 100, align: 'right'});

      doc.text('Acciones: ', 60, 540, { width: 130, align: 'left'});
      doc.text(actionsInfo, 200, 540, { width: 100, align: 'right'});

      doc.text('Total General de Acciones: ', 60, 550, { width: 140, align: 'left'});
      doc.text(totalAccionesInfo, 200, 550, { width: 100, align: 'right'});

      doc.rect(50, 510, 260, 60).stroke().opacity(0.7);

  
  
      doc.pipe(res)
  
      doc.end()
    })
  })
})

module.exports = router