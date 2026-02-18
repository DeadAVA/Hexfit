/**
 * Servicio de exportación de programas a PDF
 * Genera PDFs con formato de días de la semana e imágenes de ejercicios
 */

import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { database } from "../db/database";
import { Program, ProgramDay, DayItemWithExercise, getDayLabel } from "../shared/types";

export interface ProgramExportData {
  program: Program;
  athlete: {
    name: string;
    age: number;
  };
  days: {
    dayOfWeek: number;
    dayLabel: string;
    title?: string;
    items: DayItemWithExercise[];
  }[];
}

/**
 * Obtiene los datos completos de un programa para exportar
 */
export function getProgramExportData(programId: string): ProgramExportData | null {
  try {
    const program = database.getPrograms().find((p) => p.id === programId);
    if (!program) return null;

    const athlete = database.getAthletes().find((a) => a.id === program.athlete_id);
    if (!athlete) return null;

    const programDays = database.getProgramDays(programId);

    const days = programDays.map((day) => {
      const items = database.getDayItemsWithExercises(day.id);
      return {
        dayOfWeek: day.day_of_week,
        dayLabel: getDayLabel(day.day_of_week),
        title: day.title,
        items: items.sort((a, b) => a.order_index - b.order_index),
      };
    });

    // Ordenar días por day_of_week
    days.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

    return {
      program,
      athlete: {
        name: athlete.name,
        age: athlete.age,
      },
      days,
    };
  } catch (error) {
    console.error("Error obteniendo datos del programa:", error);
    return null;
  }
}

/**
 * Genera el HTML para el PDF
 */
function generateProgramHTML(data: ProgramExportData): string {
  const { program, athlete, days } = data;

  const daysHTML = days
    .map(
      (day) => `
    <div class="day-section">
      <h2 class="day-title">${day.dayLabel}${day.title ? ` - ${day.title}` : ""}</h2>
      
      ${
        day.items.length === 0
          ? '<p class="no-exercises">Sin ejercicios</p>'
          : `
            <table class="exercise-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th class="col-image">Imagen</th>
                  <th class="col-name">Ejercicio</th>
                  <th class="col-sets">Series</th>
                  <th class="col-reps">Reps</th>
                  <th class="col-rest">Descanso</th>
                </tr>
              </thead>
              <tbody>
                ${day.items
                  .map((item, idx) => {
                    const reps =
                      item.reps_min === item.reps_max
                        ? `${item.reps_min}`
                        : `${item.reps_min}-${item.reps_max}`;
                    return `
                  <tr>
                    <td class="col-num">${idx + 1}</td>
                    <td class="col-image">
                      ${
                        item.exercise?.image_uri
                          ? `<img src="${item.exercise.image_uri}" class="exercise-image" />`
                          : ""
                      }
                    </td>
                    <td class="col-name">
                      <div class="exercise-name">${item.exercise?.name || "Ejercicio desconocido"}</div>
                      <div class="exercise-details">${item.exercise?.muscle_group || ""}${item.exercise?.equipment ? ` • ${item.exercise.equipment}` : ""}</div>
                      ${item.notes ? `<div class="exercise-notes">📝 ${item.notes}</div>` : ""}
                    </td>
                    <td class="col-sets">${item.sets}</td>
                    <td class="col-reps">${reps}</td>
                    <td class="col-rest">${item.rest_seconds}s</td>
                  </tr>
                `;
                  })
                  .join("")}
              </tbody>
            </table>
          `
      }
    </div>
  `
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      padding: 12px;
      background: #ffffff;
      color: #000000;
      font-size: 12px;
      line-height: 1.25;
    }
    
    .header {
      text-align: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 2px solid #00d4ff;
    }
    
    .header h1 {
      font-size: 20px;
      font-weight: 700;
      color: #000000;
      margin-bottom: 4px;
    }
    
    .header .athlete-name {
      font-size: 14px;
      color: #00d4ff;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .header .program-notes {
      font-size: 12px;
      color: #666666;
      margin-top: 6px;
      font-style: italic;
    }
    
    .day-section {
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    
    .day-title {
      font-size: 16px;
      font-weight: 700;
      color: #000000;
      background: #f0f0f0;
      padding: 8px 10px;
      border-left: 3px solid #00d4ff;
      margin-bottom: 10px;
    }
    
    .no-exercises {
      color: #999999;
      font-style: italic;
      padding: 8px;
      text-align: center;
    }
    
    .exercise-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      page-break-inside: avoid;
    }
    
    .exercise-table th,
    .exercise-table td {
      border: 1px solid #e0e0e0;
      padding: 6px;
      vertical-align: top;
      background: #ffffff;
    }
    
    .exercise-table thead th {
      background: #f0f0f0;
      font-weight: 700;
      font-size: 11px;
    }
    
    .col-num { width: 28px; text-align: center; }
    .col-image { width: 68px; text-align: center; }
    .col-name { width: auto; }
    .col-sets { width: 50px; text-align: center; }
    .col-reps { width: 60px; text-align: center; }
    .col-rest { width: 64px; text-align: center; }
    
    .exercise-name {
      font-size: 12px;
      font-weight: 600;
      color: #000000;
      margin-bottom: 2px;
    }
    
    .exercise-details {
      font-size: 10px;
      color: #666666;
      margin-bottom: 4px;
    }
    
    .exercise-image {
      width: 56px;
      height: 56px;
      object-fit: contain;
      border-radius: 6px;
      background: #ffffff;
      border: 1px solid #e0e0e0;
      display: block;
      margin: 0 auto;
    }
    
    .exercise-notes {
      font-size: 10px;
      color: #444444;
      background: #f9f9f9;
      padding: 4px 6px;
      border-radius: 4px;
      border-left: 3px solid #00d4ff;
    }
    
    .footer {
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
      font-size: 10px;
      color: #999999;
    }
    
    @media print {
      body {
        padding: 8px;
      }
      
      .day-section {
        page-break-after: auto;
      }
      
      .exercise-item {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${program.name}</h1>
    <div class="athlete-name">👤 ${athlete.name}</div>
    ${program.notes ? `<div class="program-notes">${program.notes}</div>` : ""}
  </div>
  
  ${daysHTML}
  
  <div class="footer">
    <p>Generado el ${new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })}</p>
    <p>Hexfit - Training Program</p>
  </div>
</body>
</html>
  `;
}

/**
 * Exporta un programa a PDF y lo comparte
 */
export async function exportProgramToPDF(programId: string): Promise<boolean> {
  try {
    const data = getProgramExportData(programId);
    if (!data) {
      throw new Error("No se pudieron obtener los datos del programa");
    }

    // Generar HTML
    const html = generateProgramHTML(data);

    // Generar PDF
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    // Compartir el PDF
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        dialogTitle: `${data.program.name} - ${data.athlete.name}`,
        UTI: "com.adobe.pdf",
      });
    } else {
      console.log("PDF guardado en:", uri);
    }

    return true;
  } catch (error) {
    console.error("Error exportando a PDF:", error);
    throw error;
  }
}

/**
 * Genera un nombre de archivo para el PDF
 */
export function generatePDFFilename(programName: string, athleteName: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const cleanProgramName = programName.replace(/[^a-zA-Z0-9]/g, "_");
  const cleanAthleteName = athleteName.replace(/[^a-zA-Z0-9]/g, "_");
  return `${cleanProgramName}_${cleanAthleteName}_${timestamp}.pdf`;
}
