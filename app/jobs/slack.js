import Slack from 'slack-node';

const slack = new Slack();

export const teacherProfile = async () => {
  const webhookUri = 'https://hooks.slack.com/services/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';
  slack.setWebhook(webhookUri);
  slack.webhook(
    {
      text: '인터넷 검색 포털 사이트',
      attachments: [
        {
          fallback: '링크주소: <https://www.google.com|구글>',
          pretext: '링크주소: <https://www.google.com|구글>',
          color: '#00FFFF',
          fields: [
            {
              title: '알림',
              value: '해당링크를 클릭하여 검색해 보세요.',
              short: false
            }
          ]
        }
      ]
    },
    function (err, response) {
      console.log(response);
    }
  );
};
