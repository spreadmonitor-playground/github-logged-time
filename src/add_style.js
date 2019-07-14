/**
 * Adds the script global styles to the document.
 */
GM_addStyle(`
  #github-logged-time-chart-root #hour-wrapper {
    position: absolute;
    width: 119px;
    height: 119px;
    background: conic-gradient(red 100%, transparent 0);
    color: black;
    top: 81px;
    left: 40px;
    border-radius: 50%;
    overflow: hidden;
  }

  #github-logged-time-chart-root #hour-wrapper #clock {
    background: white;
    position: absolute;
    width: 109px;
    height: 111px;
    top: 4px;
    left: 5px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  #github-logged-time-chart-root #hour-wrapper #clock span:nth-child(1) {
    font-size: 13px;
    font-weight: 400;
  }
  #github-logged-time-chart-root #hour-wrapper #clock span:nth-child(2) {
    font-size: 7px;
    font-weight: 800;
  }

  #github-logged-time-chart-root #hour-wrapper #clock span:nth-child(3) {
    font-size: 12px;
    font-weight: 800;
  }

  #github-logged-time-chart-root .github-logged-time-chart-wrapper-block {
    position: relative;
  }
`);
