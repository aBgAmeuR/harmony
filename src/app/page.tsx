import { FileDropZone } from "@/components/file-dropzone";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  // const data = await prisma.user.findUnique({
  //   where: {
  //     id: "37.65.94.168"
  //   },
  //   select: {
  //     id: true,
  //     username: true,
  //     allTimeTracks: true,
  //   }
  // });


  return (
    <div className="h-screen flex justify-center items-center">
      <FileDropZone className="container" />
    </div>
  );
}
