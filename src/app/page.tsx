import { GetFileInputs } from "@/components/get-file-inputs";
import { Text, Title } from "@mantine/core";
import Link from "next/link";

export default function Home() {

  return (
    <>
      {/* <header className="flex items-center justify-center h-16 bg-secondary">
        <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-2">
          <rect y="2.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 2.09082)" fill="#141414" />
          <g clip-path="url(#clip0_148_68)">
            <path d="M9.29199 17.8384L7.74693 17.9465C7.15836 17.9876 6.71817 18.5473 6.76356 19.1964L7.16359 24.9172C7.20899 25.5664 7.72279 26.0593 8.31136 26.0182L9.85641 25.9101C10.445 25.869 10.8852 25.3093 10.8398 24.6601L10.4397 18.9394C10.3944 18.2902 9.88055 17.7973 9.29199 17.8384Z" fill="#1ED760" />
            <path d="M13.5895 6.72956L12.0444 6.8376C11.4559 6.87875 11.0157 7.43839 11.061 8.0876L12.2132 24.5641C12.2586 25.2132 12.7724 25.7062 13.361 25.665L14.906 25.557C15.4946 25.5158 15.9348 24.9562 15.8894 24.307L14.7372 7.83054C14.6918 7.18133 14.178 6.6884 13.5895 6.72956Z" fill="#1ED760" />
            <path d="M19.1486 13.6627L17.6035 13.7707C17.015 13.8119 16.5605 14.1678 16.5883 14.5658L17.2946 24.6658C17.3224 25.0637 17.822 25.3529 18.4105 25.3118L19.9556 25.2037C20.5441 25.1626 20.9986 24.8066 20.9708 24.4087L20.2645 14.3087C20.2367 13.9108 19.7371 13.6215 19.1486 13.6627Z" fill="#1ED760" />
            <path d="M23.9237 9.38483L22.3786 9.49287C21.7901 9.53402 21.3561 10.1829 21.4092 10.9421L22.2984 23.6586C22.3515 24.4178 22.8716 25 23.4601 24.9588L25.0052 24.8508C25.5937 24.8096 26.0277 24.1607 25.9746 23.4016L25.0854 10.6851C25.0323 9.92582 24.5122 9.34368 23.9237 9.38483Z" fill="#1ED760" />
          </g>
          <defs>
            <clipPath id="clip0_148_68">
              <rect width="18.8709" height="18.8734" fill="white" transform="translate(5.92926 7.26514) rotate(-4)" />
            </clipPath>
          </defs>
        </svg>
        <Title order={2}>Harmony</Title>
      </header> */}
      <main className="flex flex-col p-8 mx-auto w-full max-w-2xl gap-12">
        {/* <Text>Harmony is a website that generates stats from your Spotify data Package. To get started, click the button below to upload your Spotify Data Package.</Text> */}
        {/* <Link href="/help" className="bg-secondary w-full relative flex flex-col items-center justify-center select-none p-5 rounded-lg">
          <Text>Get my Spotify Data 👆</Text>
          <Text>(click on this button)</Text>
          <div className="absolute top-0 left-0 -translate-x-1/3 -translate-y-1/3">
            <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
              <g clip-path="url(#clip0_151_82)">
                <path d="M17.758 7.77778L18.9506 24.8338L15.5839 25.0692L14.6626 11.8944L10.7077 13.4631L10.5221 10.8094L17.3956 7.80312L17.758 7.77778Z" fill="#C9C9C9" />
              </g>
              <defs>
                <clipPath id="clip0_151_82">
                  <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </Link> */}
        <GetFileInputs />
      </main>
      {/* <footer className="absolute bottom-0 right-0 left-0 flex items-center justify-start h-16 px-4 bg-secondary">
        <Text>Made with ❤️ by aBgAmeuR. Harmony is an open source software.</Text>
      </footer> */}
    </>
  );
}
