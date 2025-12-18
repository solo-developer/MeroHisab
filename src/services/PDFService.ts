import { Platform, Share } from 'react-native';
import * as RNHTMLtoPDF from 'react-native-html-to-pdf';

export interface PDFColumn {
  header: string;
  key: string;
  width?: string;
  render?: (value: any, row?: any) => string;
}

export interface PDFGenerateOptions {
  title: string;
  data: any[];
  columns: PDFColumn[];
  fileName?: string;
}

export const generatePDF = async ({
  title,
  data,
  columns,
  fileName,
}: PDFGenerateOptions) => {
  const tableHeader = columns
    .map(
      col =>
        `<th style="border: 1px solid #ccc; padding: 8px; text-align:left;">${col.header}</th>`
    )
    .join('');

  const tableRows = data
    .map(
      row =>
        `<tr>${columns
          .map(col => {
            const value = row[col.key];
            const display = col.render ? col.render(value, row) : value ?? '';
            return `<td style="border: 1px solid #ccc; padding: 8px;">${display}</td>`;
          })
          .join('')}</tr>`
    )
    .join('');

  const htmlContent = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: Arial, sans-serif; font-size: 12px; padding: 16px; }
          h1 { text-align: center; font-size: 18px; margin-bottom: 16px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
          th { background-color: #f2f2f2; text-align: left; }
          td { text-align: left; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <table>
          <thead><tr>${tableHeader}</tr></thead>
          <tbody>${tableRows}</tbody>
        </table>
      </body>
    </html>
  `;

  const options = {
    html: htmlContent,
    fileName: fileName || title.replace(/\s+/g, '_'),
    directory: 'Documents',
  };

  // @ts-ignore
  const pdfFile = await RNHTMLtoPDF.convert(options);

  // Share PDF on mobile
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    await Share.share({
      url: pdfFile.filePath,
      title: title,
    });
  }

  return pdfFile.filePath;
};
