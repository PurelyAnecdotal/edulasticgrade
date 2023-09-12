const iframe = document.createElement('iframe');
document.body.appendChild(iframe);

const { fetch, open } = iframe.contentWindow;

iframe.style.display = 'none';

const headers = new Headers({
    Authorization: localStorage.getItem(
        JSON.parse(localStorage.getItem('tokens'))[0]
    ),
});

const fetchAPI = async (url) =>
    (
        await (
            await fetch(`https://app.edulastic.com/api/${url}`, { headers })
        ).json()
    ).result;

const popup = open('about:blank');

const popupHTML = await (
    await fetch(
        'https://cdn.jsdelivr.net/gh/nonexistent-name/edulasticgrade/popup.html'
    )
).text();

popup.document.write(popupHTML);
popup.document.close();

const path = location.pathname.split('/');

const test = await fetchAPI(
    `test/${path[5]}/minimal?testActivityId=${path[7]}`
);

popup.document.getElementById('title').innerText = test.title;

const report = await fetchAPI(
    `test-activity/${path[7]}/report?groupId=${path[3]}`
);

const total = report.questionActivities.length;
const wrong = report.testActivity.wrong;
const correct = total - wrong;

popup.document.getElementById('score').innerText = `${
    Math.round((correct / total) * 1000) / 10
}% ${correct}/${total}`;

popup.document.getElementById('p-inner').style.width = `${
    (correct / total) * 100
}%`;

const questionList = popup.document.getElementById('questions');

const parser = new DOMParser();
const parse = (html) => parser.parseFromString(html, 'text/html');

test.itemGroups[0].items
    .filter((item) => item.rows[0].widgets[0].type === 'multipleChoice')
    .map((item) => item.data.questions[0])
    .forEach((question) => {
        const parsed = parse(question.stimulus).body;

        const li = document.createElement('li');
        li.innerText = `${parsed.innerText.trim()} `;
        questionList.appendChild(li);

        const rawBtn = document.createElement('button');
        rawBtn.innerText = 'View Raw';
        rawBtn.addEventListener('click', () => {
            const rawPopup = open('about:blank', '', 'popup');
            rawPopup.document.write(question.stimulus);
        });
        li.appendChild(rawBtn);

        if (parsed.querySelector('img')) {
            const imglink = document.createElement('a');
            imglink.href = parsed.querySelector('img').src;
            imglink.target = '_blank';
            li.appendChild(imglink);

            const img = document.createElement('img');
            img.src = parsed.querySelector('img').src;
            imglink.appendChild(img);
        }

        const options = document.createElement('ul');
        li.appendChild(options);

        question.options
            .map((option) => `${parse(option.label).body.innerText.trim()} `)
            .forEach((label) => {
                const option = document.createElement('li');
                option.innerText = label;
                options.appendChild(option);
            });
    });

test.itemGroups[0].items
    .filter((item) => item.rows[0].widgets[0].type === 'choiceMatrix')
    .map((item) => item.data.questions[0])
    .forEach((question) => {
        const li = document.createElement('li');
        li.innerText = `${parse(question.stimulus).body.innerText.trim()} `;
        questionList.appendChild(li);

        const table = document.createElement('table');
        li.appendChild(table);
        const row = document.createElement('tr');
        table.appendChild(row);
        
        question.options
            .map((header) => parse(header).body.innerText.trim())
            .forEach((header) => {
                const cell = document.createElement('th');
                cell.innerText = header;
                row.appendChild(cell);
            });

        const options = document.createElement('ul');
        li.appendChild(options);

        question.stems
            .map((stem) => `${parse(stem).body.innerText.trim()} `)
            .forEach((stem) => {
                const option = document.createElement('li');
                option.innerText = stem;
                options.appendChild(option);
            });
    });

questionList.style.opacity = 1;
questionList.style.transform = 'translateY(0)';
