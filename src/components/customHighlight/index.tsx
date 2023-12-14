export default function customHighlight(content: any, chat: boolean = false) {
  content = content.replace(/\n/g, "<br>");

  if (!chat) {
    content = content.replace(/\{\{((?:[^{}]|(?:\{\{[^{}]*\}\}))*?)\}\}/g, (match: any, p1: any) => {
      return `<span style="background-color: #ff8b1a; padding: .2rem; border-radius: .3rem;">${p1}</span>`;
    });

    content = content.replace(/\+(.*?)\+/g, (match: any, p1: any) => {
      return `<span style="background-color: #4287f5; padding: .2rem; border-radius: .3rem;">${p1}</span>`;
    });
  }

  content = content.replace(/\*(.*?)\*/g, (match: any, p1: any) => {
    return `<span style="font-weight: 900;">${p1}</span>`;
  });

  content = content.replace(/\_(.*?)\_/g, (match: any, p1: any) => {
    return `<span style="font-style: italic;">${p1}</span>`;
  });

  content = content.replace(/\~(.*?)\~/g, (match: any, p1: any) => {
    return `<span style="text-decoration: line-through;">${p1}</span>`;
  });

  content = content.replace(/```(.*?)```/g, (match: any, p1: any) => {
    return `<span style="font-family: monospace;">${p1}</span>`;
  });

  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
