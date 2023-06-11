function Spinner({ cx }: { cx?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={cx}>
      <path
        d="M12,24A12,12,0,1,1,22.714,6.59a1,1,0,1,1-1.785.9,10,10,0,1,0-.011,9.038,1,1,0,0,1,1.781.908A11.955,11.955,0,0,1,12,24Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default Spinner;
