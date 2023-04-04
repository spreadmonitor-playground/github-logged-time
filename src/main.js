// @ts-check

class GithubLoggedTimeChart {
  /**
   * Setups the event listeners and loads initial state.
   *
   * @param {{ togglApiKey: string, projectIdMap: { [key: string]: number[] }, usernameMap: { [key: string]: string} }} settings
   */
  constructor(settings) {
    this.togglAuthHeader = `Basic ${window.btoa(`${settings.togglApiKey}:api_token`)}`;
    this.projectIdMap = settings.projectIdMap;
    this.usernameMap = settings.usernameMap;

    this.typeColorMap = Object.seal({
      build: '#80cbc4',
      discussion: '#bdbdbd',
      docs: '#1e88e5',
      meeting: '#8e24aa',
      feat: '#4db6ac',
      remaining: '#eee',
      fix: '#e53935',
      chore: '#fbc02d',
      refactor: '#009688',
    });

    try {
      const pageDetails = this.parseUrl(location.href);

      // render the initial structure
      this.renderStructure();
      // init the chart in the rendered structure
      this.chart = this.initChart();
      this.requestTogglEntiresList(pageDetails.repository, pageDetails.issueNumber).then(data => this.updateUI(data));
    } catch (error) {
      console.error('Could not render Github Logged Time Chart!');
      console.error(error);
    }
  }

  /**
   * Parses a github URL and returns the org, repo and issue number.
   *
   * @param {string} url full URL of the current page
   *
   * @returns {{ organization: string, repository: string, issueNumber: number }}
   */
  parseUrl(url) {
    const regex = /github\.com\/([a-zA-Z0-9\-]+)\/([a-zA-Z0-9\-]+)\/issues\/([0-9]+)/;
    const matches = url.match(regex);

    if (!matches) {
      throw new Error('URL parsing failed, not on a Github issue details page.');
    }

    return { organization: matches[1], repository: matches[2], issueNumber: Number.parseInt(matches[3], 10) };
  }

  /**
   * Renders the empty chart root what we can manipulate later
   */
  renderStructure() {
    /** First we remove the previous chart if one has been added already. */
    let existing = document.getElementById('github-logged-time-chart-root');

    if (existing) {
      existing.parentNode.removeChild(existing);
      existing = null;
    }

    const chartRoot = document.createElement('div');
    chartRoot.id = 'github-logged-time-chart-root';
    chartRoot.classList.add('discussion-sidebar-item', 'sidebar-assignee', 'js-discussion-sidebar-item');

    const stylingDiv = document.createElement('div');
    stylingDiv.classList.add('js-issue-sidebar-form');
    chartRoot.appendChild(stylingDiv);

    const detailsDiv = document.createElement('div');
    detailsDiv.classList.add(
      'details-reset',
      'details-overlay',
      'select-menu',
      'js-select-menu',
      'js-dropdown-details',
      'js-load-contents'
    );
    stylingDiv.appendChild(detailsDiv);

    const summaryDiv = document.createElement('div');
    summaryDiv.classList.add(
      'text-bold',
      'discussion-sidebar-heading',
      'discussion-sidebar-toggle',
      'github-logged-time-chart-wrapper-block'
    );
    detailsDiv.appendChild(summaryDiv);

    const titleSpan = document.createElement('span');
    titleSpan.innerText = 'Github Logged Time Chart';

    const chartContainer = document.createElement('div');
    chartContainer.id = 'chartContainer';
    chartContainer.style.height = '240px';
    chartContainer.style.width = '100%';

    const hourWrapper = document.createElement('div');
    hourWrapper.id = 'hour-wrapper';

    summaryDiv.appendChild(titleSpan);
    summaryDiv.appendChild(chartContainer);
    summaryDiv.appendChild(hourWrapper);

    const clockDiv = document.createElement('div');
    clockDiv.id = 'clock';
    clockDiv.appendChild(document.createElement('span'));
    clockDiv.appendChild(document.createElement('span'));
    clockDiv.appendChild(document.createElement('span'));

    hourWrapper.appendChild(clockDiv);

    const developersRoot = document.createElement('div');
    const developerList = document.createElement('ul');
    developerList.id = 'developer-list';
    developersRoot.appendChild(developerList);

    /** Append the finald structure to the DOM */
    document.getElementById('partial-discussion-sidebar')?.prepend(developersRoot);
    document.getElementById('partial-discussion-sidebar')?.prepend(chartRoot);
  }

  initChart() {
    const chart = new CanvasJS.Chart('chartContainer', {
      title: null,
      animationEnabled: true,
      toolTip: {
        contentFormatter: e => {
          if (e.entries[0].dataPoint.name === 'remaining') {
            return `${e.entries[0].dataPoint.name}: ${this.secToTime(e.entries[0].dataPoint.y)}`;
          }
          return `${e.entries[0].dataPoint.message}: ${this.secToTime(e.entries[0].dataPoint.y)}`;
        },
      },
      data: [
        {
          type: 'doughnut',
          startAngle: 270,
          yValueFormatString: '',
          dataPoints: [],
        },
      ],
    });

    return chart;
  }

  /**
   * Updates the UI with the data.
   * @param {{ description: string, type: string, duration: number, message: string }[]} data
   */
  updateUI(data) {
    let percent;
    const estimation = this.mapEffortLabelsToMinutes();
    const spentTime = data.reduce((acc, next) => acc + next.duration, 0);
    const slices = data.map(entry => ({
      color: this.mapEntyTypeToColor(entry.type),
      y: entry.duration,
      name: `${entry.type}`,
      message: entry.message,
    }));

    const map = new Map();

    for (const { user, duration } of data) {
      if (map.get(user) === undefined) {
        map.set(user, duration);
      } else {
        let val = map.get(user);
        val += duration;
        map.set(user, val);
      }
    }

    const developerList = document.getElementById('developer-list');

    map.forEach((timeDuration, name) => {
      let devItem = document.createElement('li');
      devItem.style.display = 'flex';
      devItem.style.justifyContent = 'space-between';
      devItem.style.listStyleType = 'none';

      let nameSpan = document.createElement('span');
      nameSpan.innerText = this.usernameMap[name];

      let timeSpan = document.createElement('span');
      timeSpan.innerText = this.timeToHhMm(this.secToTime(timeDuration));

      devItem.appendChild(nameSpan);
      devItem.appendChild(timeSpan);
      developerList?.appendChild(devItem);
    });

    if (spentTime < estimation) {
      slices.push({
        color: this.mapEntyTypeToColor('remaining'),
        y: estimation - spentTime,
        name: `remaining`,
        message: '',
      });
    }

    document.querySelector('#hour-wrapper #clock span:nth-child(1)').innerText = `${this.secToTime(spentTime)}`;

    if (estimation > 0) {
      document.querySelector('#hour-wrapper #clock span:nth-child(2)').innerText = `${this.secToTime(estimation)}`;
      document.querySelector('#hour-wrapper #clock span:nth-child(1)').style.color =
        estimation && spentTime < estimation ? '#80cbc4' : '#e53935';

      if (spentTime <= estimation) {
        percent = 100 / (estimation / spentTime);
        document.querySelector('#hour-wrapper #clock span:nth-child(3)').style.color = 'green';
        document.querySelector('#hour-wrapper').style.background = `conic-gradient(green 100%, transparent 0)`;
      } else {
        percent = 100 / (estimation / (spentTime - estimation));
        let pRing = 100 / (spentTime / estimation);
        document.querySelector('#hour-wrapper #clock span:nth-child(3)').style.color = 'red';
        document.querySelector('#hour-wrapper').style.background = `conic-gradient(green ${pRing}%, transparent 0)`;
      }

      document.querySelector('#hour-wrapper #clock span:nth-child(3)').innerText = `${percent.toFixed(0)}%`;
    } else {
      document.querySelector('#hour-wrapper').style.background = 'transparent';
      document.querySelector('#hour-wrapper #clock span:nth-child(2)').innerText = `No estimation`;
      document.querySelector('#hour-wrapper #clock span:nth-child(3)').innerText = ``;
    }

    this.chart.options.data[0].dataPoints = slices;

    this.chart.render();

    const waterMark = document.querySelector('.canvasjs-chart-credit');
    if (waterMark) {
      waterMark.parentNode.removeChild(waterMark);
    }
  }

  /**
   * Loads the list of time entries from Toggl
   *
   * @param {string} repository - the current repository
   * @param {number} issueNumber - the issue number of currently open Github issue details page
   *
   * @returns {Promise<{ description: string, type: string, duration: number, message: string }[]>}
   */
  async requestTogglEntiresList(repository, issueNumber) {
    const firstPageResult = await this.requestPage(repository, issueNumber);

    return firstPageResult
      .map(item => {
        let duration = 0
        item.time_entries.forEach(timeEntry => duration += timeEntry.seconds)

        return {
        description: item.description.split(': ')[1],
        type: item.description.split(':')[0].split('(')[0],
        duration: duration,
        message: item.description,
        user: item.username,
      }});
  }

  /**
   * Loads one page from the Toggl API.
   *
   * @param {string} repository
   * @param {number} issueNumber
   *
   * @returns {Promise<any>}
   */
  requestPage(repository, issueNumber) {
    const dateOneYearBefore = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      .toISOString()
      .split('T')[0];
    const currentDate = new Date()
      .toISOString()
      .split('T')[0];
    const baseUrl = `https://api.track.toggl.com/reports/api/v3/workspace/2656645/search/time_entries`;
    const body = JSON.stringify({
      project_ids: this.projectIdMap[repository], 
      start_date: dateOneYearBefore, 
      end_date: currentDate, 
      description: issueNumber.toString(), 
      order_by: 'date', 
      order_dir: 'asc'
    })

    return new Promise((resolve, reject) => {
      GM_xmlhttpRequest({
        method: 'POST',
        url: baseUrl,
        data: body,
        headers: { Authorization: this.togglAuthHeader },
        onerror: reject,
        onload: ({ response }) => resolve(JSON.parse(response)),
      });
    });
  }

  /**
   * Returns the HEX color code of a time entry type (eg: feat, fix)
   *
   * @param {string} timeEntryType
   * @returns {string} the HEX color code for this entry type or empty string
   */
  mapEntyTypeToColor(timeEntryType) {
    return this.typeColorMap[timeEntryType] || '';
  }

  /**
   * Maps the effor labels from an issue to number of seconds.
   *
   * @param {string} selector selector to retrive a nodelist of HTMLAnchorElement-s
   *
   * @returns {number} sum of estimated effor in seconds
   */
  mapEffortLabelsToMinutes(selector = '.discussion-sidebar-item .labels a') {
    const nodeList = document.querySelectorAll(selector);
    const labelRegexp = /^effort([0-9]):/;
    let sum = 0;

    nodeList.forEach(labelElement => {
      /** @type {HTMLAnchorElement} */
      // @ts-ignore - in JSDOC we cannot defind what elements `querySelectorAll` returns, so we cast here
      const castedLabelElement = labelElement;
      const matches = castedLabelElement.text.match(labelRegexp);

      if (matches) {
        sum += this.mapEffortNumberToSeconds(Number.parseInt(matches[1]));
      }
    });

    return sum;
  }

  /**
   * Maps the effort number from an `effort*` label to seconds.
   *
   * @param {number} effortNumber array of assigned labels
   *
   * @returns {number} sum of estimated effor in seconds
   */
  mapEffortNumberToSeconds(effortNumber) {
    switch (effortNumber) {
      case 0:
        return 20 * 60;
      case 1:
        return 60 * 60;
      case 2:
        return 2 * 60 * 60;
      case 3:
        return 4 * 60 * 60;
      case 4:
        return 8 * 60 * 60;
      case 5:
        return 2 * 8 * 60 * 60;
      case 6:
        return 3 * 8 * 60 * 60;
      case 7:
        return 4 * 8 * 60 * 60;
      case 8:
        return 5 * 8 * 60 * 60;
      default:
        return 0;
    }
  }

  /**
   * Converts number of seconds into human readable time format.
   *
   * @param {number} seconds
   *
   * @returns {string} time in "hh:mm:ss" format
   */
  secToTime(seconds) {
    const addPadding = x => (x < 9 ? `0${x}` : x);
    const hours = Math.floor(seconds / 60 / 60);
    let left = seconds - hours * 60 * 60;
    const minutes = Math.floor(left / 60);
    left = left - minutes * 60;
    return `${addPadding(hours)}:${addPadding(minutes)}:${addPadding(left)}`;
  }

  /**
   * Converts 'hh:mm:ss' formatted string into 'hh:mm' format.
   *
   * @param {string} timeStr
   *
   * @return {string} time in "hh:mm" format.
   */
  timeToHhMm(timeStr) {
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }
}
