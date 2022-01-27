const { IncomingWebhook } = require('@slack/webhook');

export const newChat = async chatDTO => {
  try {
    const url = 'https://hooks.slack.com/services/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';
    const webhook = new IncomingWebhook(url);
    let payload, tag;
    if (chatDTO.tag === 'chat') {
      tag = '텍스트';
      payload = [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `${chatDTO.sender.name} : ${chatDTO.body.text}`,
            emoji: true
          }
        }
      ];
    } else if (chatDTO.tag === 'weight') {
      tag = '몸무게';
      payload = [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `${chatDTO.sender.name} : 몸무게를 입력하였습니다.`,
            emoji: true
          }
        }
      ];
    } else if (chatDTO.tag === 'picture') {
      tag = '기타 사진';
      payload = [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `${chatDTO.sender.name} : 일반 사진을 입력하였습니다.`,
            emoji: true
          }
        }
      ];
    } else {
      tag = '식단 사진';
      payload = [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `${chatDTO.sender.name} : 식단 사진을 입력하였습니다.`,
            emoji: true
          }
        },
        {
          type: 'image',
          image_url: `${chatDTO.body.thumbnail}&w=200&h=200`,
          alt_text: chatDTO.tag
        }
      ];
    }
    payload = {
      blocks: payload
    };
    await webhook.send(payload);
  } catch (err) {
    console.log(err);
  }
};

export const newUser = async userDTO => {
  try {
    const url = 'https://hooks.slack.com/services/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';
    const webhook = new IncomingWebhook(url);
    await webhook.send({
      blocks: [
        {
          type: 'section',
          text: {
            type: 'plain_text',
            text: `새로운 사용자가 가입하였습니다 : ${userDTO.name}`,
            emoji: true
          }
        }
      ]
    });
  } catch (err) {
    console.log(err);
  }
};
