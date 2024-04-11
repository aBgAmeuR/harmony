import React from 'react'

type StepsProps = {
  number: number
}

export const Steps = ({ number }: StepsProps) => {
  switch (number) {
    case 1:
      return (
        <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
          <g clipPath="url(#clip0_151_82)">
            <path d="M17.758 7.77778L18.9506 24.8338L15.5839 25.0692L14.6626 11.8944L10.7077 13.4631L10.5221 10.8094L17.3956 7.80312L17.758 7.77778Z" fill="#C9C9C9" />
          </g>
          <defs>
            <clipPath id="clip0_151_82">
              <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
            </clipPath>
          </defs>
        </svg>
      )
    case 2:
      return (
        <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
          <g clipPath="url(#clip0_151_82)">
            <path d="M22.2036 21.9632L22.3876 24.5935L10.7441 25.4076L10.5872 23.1631L15.6804 16.8745C16.1907 16.2202 16.5893 15.648 16.8761 15.1581C17.1624 14.6603 17.3626 14.2195 17.4767 13.8356C17.5981 13.4434 17.6468 13.0758 17.6228 12.7329C17.5869 12.2185 17.4703 11.7842 17.2733 11.4299C17.0756 11.0678 16.8022 10.7971 16.4529 10.6179C16.1114 10.4382 15.6991 10.3652 15.2159 10.399C14.7015 10.435 14.266 10.5907 13.9093 10.8663C13.5605 11.1413 13.3042 11.5077 13.1404 11.9656C12.9844 12.4229 12.9261 12.9321 12.9653 13.4932L9.58682 13.7295C9.51598 12.7163 9.69272 11.772 10.1171 10.8965C10.5409 10.0132 11.1756 9.29141 12.0214 8.73104C12.8667 8.16289 13.8933 7.83657 15.1013 7.7521C16.2937 7.66872 17.3126 7.79326 18.1582 8.12571C19.011 8.44982 19.6732 8.95956 20.1447 9.65492C20.6235 10.3419 20.8978 11.1842 20.9675 12.1818C21.0068 12.7429 20.9556 13.2986 20.8139 13.8489C20.6717 14.3914 20.4516 14.9394 20.1535 15.4927C19.8627 16.0378 19.5023 16.5955 19.0723 17.166C18.6423 17.7364 18.163 18.3299 17.6344 18.9464L14.9089 22.4733L22.2036 21.9632Z" fill="#C9C9C9" />
          </g>
          <defs>
            <clipPath id="clip0_151_82">
              <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
            </clipPath>
          </defs>
        </svg>
      )
    default:
      return (
        <svg width="32" height="34" viewBox="0 0 32 34" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="3.09082" width="29.9786" height="30.0243" rx="4.02579" transform="rotate(-4 0 3.09082)" fill="#141414" />
          <g clipPath="url(#clip0_151_82)">
            <path d="M17.758 7.77778L18.9506 24.8338L15.5839 25.0692L14.6626 11.8944L10.7077 13.4631L10.5221 10.8094L17.3956 7.80312L17.758 7.77778Z" fill="#C9C9C9" />
          </g>
          <defs>
            <clipPath id="clip0_151_82">
              <rect width="18" height="32" fill="white" transform="translate(5.90582 1.6875) rotate(-4)" />
            </clipPath>
          </defs>
        </svg>
      )
  }
}
