import { auth } from "@repo/auth";
import { prisma } from "@repo/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/table";

const getPackageHistory = async () => {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return null;
  }

  return await prisma.package.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const PackageHistoryUpload = async () => {
  const packages = await getPackageHistory();

  if (!packages) {
    return null;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Size</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {packages.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="">
              <p className="line-clamp-1 break-all">{item.fileName}</p>
            </TableCell>
            <TableCell>{item.createdAt.toLocaleDateString()}</TableCell>
            <TableCell>
              <p className="text-nowrap">
                {(Number(item.fileSize) / 1024).toFixed(2)} MB
              </p>
            </TableCell>
          </TableRow>
        ))}
        {packages.length === 0 && (
          <TableRow>
            <TableCell colSpan={3} className="text-center">
              No packages uploaded yet.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};
