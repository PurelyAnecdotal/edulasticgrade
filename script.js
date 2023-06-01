fetch(
    `https://app.edulastic.com/api/test-activity/${location.pathname.slice(
        -24
    )}/report?groupId=${location.pathname.slice(12, 36)}`,
    {
        headers: {
            Authorization: localStorage.getItem(
                JSON.parse(localStorage.getItem('tokens'))[0]
            ),
        },
    }
)
    .then(res => res.json())
    .then(json => {
        const result = json.result;
        const total = result.questionActivities.length;
        const wrong = result.testActivity.wrong;
        const correct = total - wrong;
        alert(
            `${correct} / ${total} correct (${
                Math.round((correct / total) * 1000) / 10
            }%)`
        );
    });
