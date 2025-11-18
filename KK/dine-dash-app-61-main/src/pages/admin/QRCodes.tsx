import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download, Printer } from "lucide-react";

const QRCodes = () => {
  const tables = Array.from({ length: 10 }, (_, i) => i + 1);
  const baseUrl = window.location.origin;

  const handlePrint = (tableNumber: number) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrCodeElement = document.getElementById(`qr-table-${tableNumber}`);
      if (qrCodeElement) {
        const svg = qrCodeElement.querySelector('svg');
        if (svg) {
          printWindow.document.write(`
            <html>
              <head>
                <title>Table ${tableNumber} QR Code</title>
                <style>
                  body {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    min-height: 100vh;
                    margin: 0;
                    font-family: Arial, sans-serif;
                  }
                  .qr-container {
                    text-align: center;
                    padding: 40px;
                    border: 2px solid #000;
                  }
                  h1 {
                    margin: 0 0 20px 0;
                    font-size: 48px;
                  }
                  .instructions {
                    margin-top: 20px;
                    font-size: 18px;
                  }
                  @media print {
                    body {
                      -webkit-print-color-adjust: exact;
                      print-color-adjust: exact;
                    }
                  }
                </style>
              </head>
              <body>
                <div class="qr-container">
                  <h1>Table ${tableNumber}</h1>
                  ${svg.outerHTML}
                  <p class="instructions">Scan to Order</p>
                </div>
              </body>
            </html>
          `);
          printWindow.document.close();
          printWindow.focus();
          setTimeout(() => {
            printWindow.print();
            printWindow.close();
          }, 250);
        }
      }
    }
  };

  const handleDownload = (tableNumber: number) => {
    const qrCodeElement = document.getElementById(`qr-table-${tableNumber}`);
    if (qrCodeElement) {
      const svg = qrCodeElement.querySelector('svg');
      if (svg) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `table-${tableNumber}-qr-code.png`;
                a.click();
                URL.revokeObjectURL(url);
              }
            });
          }
        };
        
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Table QR Codes</h1>
        <p className="text-muted-foreground">
          Generate and print QR codes for each table. Customers can scan these to place orders.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((tableNumber) => (
          <Card key={tableNumber} className="overflow-hidden">
            <CardHeader className="bg-primary/5">
              <CardTitle className="text-center text-2xl">Table {tableNumber}</CardTitle>
              <CardDescription className="text-center">
                Scan to place order
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div 
                id={`qr-table-${tableNumber}`}
                className="bg-white p-4 rounded-lg flex justify-center mb-4"
              >
                <QRCodeSVG
                  value={`${baseUrl}?table=${tableNumber}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="text-center text-sm text-muted-foreground mb-4">
                URL: {baseUrl}?table={tableNumber}
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handlePrint(tableNumber)}
                  className="flex-1"
                  variant="outline"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button
                  onClick={() => handleDownload(tableNumber)}
                  className="flex-1"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/5">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p>1. Print or download the QR codes for each table</p>
          <p>2. Place the printed QR code on the respective table</p>
          <p>3. When customers scan the QR code, they'll be directed to the menu with the table number automatically included</p>
          <p>4. Orders placed through that QR code will show the table number in the orders list</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodes;
