import {
  PatchType,
  patchDocument,
  TextRun,
  Table,
  TableRow,
  TableCell,
  Paragraph,
  WidthType,
  VerticalAlign,
} from "docx";

export async function updateText(doc, replacements) {
  const getPatches = (fields) => {
    const patches = {};
    for (const field in fields) {
      patches[field] = {
        type: PatchType.PARAGRAPH,
        children: [new TextRun({ text: fields[field] })],
      };
    }
    return patches;
  };
  const patches = getPatches(replacements);
  const updated = await patchDocument(doc, {
    outputType: "nodebuffer",
    patches,
    keepOriginalStyles: true,
  });
  return updated;
}

export async function updateTable(doc, replacements) {
  const getPatches = (fields) => {
    const patches = {};
    for (const field in fields) {
      const columnWidths = [5, 15, 45, 15, 20];
      const table = fields[field];
      const headers = Object.keys(table?.[0]);
      patches[field] = {
        type: PatchType.DOCUMENT,
        children: [
          new Table({
            width: {
              size: 100,
              type: WidthType.PERCENTAGE,
            },
            rows: [
              new TableRow({
                children: headers.map(
                  (header, index) =>
                    new TableCell({
                      width: {
                        size: columnWidths[index],
                        type: WidthType.PERCENTAGE,
                      },
                      verticalAlign: VerticalAlign.CENTER,
                      children: [
                        new Paragraph({
                          text: header,
                          alignment: "center",
                        }),
                      ],
                    })
                ),
              }),
              ...table.map(
                (row) =>
                  new TableRow({
                    children: headers.map(
                      (key, index) =>
                        new TableCell({
                          width: {
                            size: columnWidths[index],
                            type: WidthType.PERCENTAGE,
                          },
                          children: [new Paragraph(String(row?.[key]))],
                        })
                    ),
                  })
              ),
            ],
          }),
        ],
      };
    }
    return patches;
  };
  const patches = getPatches(replacements);
  const updated = await patchDocument(doc, {
    outputType: "nodebuffer",
    patches,
  });
  return updated;
}
