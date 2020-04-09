fetch('data/operators.csv')
  .then(r => r.text())
  .then(d3.csvParse)
  .then(data => {
    const tbody = document.querySelector('table.BGPSafetyTable > tbody');

    data.forEach(d => {
      const tr = document.createElement('tr');
      tr.setAttribute('data-status', d.status.split(' ').join('-'));

      const tdName = document.createElement('td');
      tdName.innerText = d.name;
      tr.appendChild(tdName);

      const tdType = document.createElement('td');
      tdType.innerText = d.type;
      tr.appendChild(tdType);

      const tdDetails = document.createElement('td');
      tdDetails.innerText = d.details;
      tr.appendChild(tdDetails);

      const tdStatus = document.createElement('td');
      tdStatus.innerText = d.status;
      tdStatus.setAttribute('data-value', `safety-scale-${[, 'safe', 'partially safe', 'unsafe'].indexOf(d.status)}`);
      tr.appendChild(tdStatus);

      tbody.appendChild(tr);
    });
  });