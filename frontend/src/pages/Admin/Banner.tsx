import { Card } from "@mui/material";
import PageTitle from "../../components/admin/PageTitle";

const BannerPage = () => {
  return (
    <>
      <PageTitle title="Banner | Goshoes Admin" />
      <h1>Home Banner Header</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Card className="h-full">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg h-full">
              Banner Home 1
            </div>
          </Card>
        </div>
        <div className="col-span-1">
          <Card className="mb-4">
            <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg">
              Banner Home 2
            </div>
          </Card>
          <Card>
            <div className="flex flex-col items-center justify-center p-4 bg-gray-800 rounded-lg">
              Banner Home 3
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};

export default BannerPage;