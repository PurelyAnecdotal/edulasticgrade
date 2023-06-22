const iframe = document.createElement('iframe');
iframe.style.display = 'none';
document.body.appendChild(iframe);

const fetch = iframe.contentWindow.fetch;
const open = iframe.contentWindow.open;

const headers = new Headers({
    Authorization: localStorage.getItem(
        JSON.parse(localStorage.getItem('tokens'))[0]
    ),
});

const fetchAPI = async url =>
    (
        await (
            await fetch(`https://app.edulastic.com/api/${url}`, {
                headers,
            })
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

const groupId = location.pathname.slice(12, 36);
const testId = location.pathname.slice(42, 66);
const reportId = location.pathname.slice(-24);

const test = await fetchAPI(
    `test/${testId}/minimal?testActivityId=${reportId}`
);

popup.document.getElementById('title').innerText = test.title;

const report = await fetchAPI(
    `test-activity/${reportId}/report?groupId=${groupId}`
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
const parse = html => parser.parseFromString(html, 'text/html');

test.itemGroups[0].items
    .filter(item => item.rows[0].widgets[0].type === 'multipleChoice')
    .map(item => item.data.questions[0])
    .forEach(question => {
        const parsed = parse(question.stimulus).body;

        const li = document.createElement('li');
        li.innerText = `${parsed.innerText.trim()} `;

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

        const optionList = document.createElement('ul');
        li.appendChild(optionList);

        question.options
            .map(option => option.label)
            .forEach(label => {
                const option = document.createElement('li');
                option.innerText = `${parse(label).body.innerText.trim()} `;

                optionList.appendChild(option);
            });

        questionList.appendChild(li);
    });

questionList.style.opacity = 1;
questionList.style.transform = 'translateY(0)';
