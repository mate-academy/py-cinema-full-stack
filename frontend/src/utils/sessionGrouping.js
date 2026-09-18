export function groupSessionsByMovie (sessions) {
  return sessions.reduce((groups, session) => {
    const group = groups.find(item => item.movie_title === session.movie_title);
    const time = { id: session.id, show_time: session.show_time };

    if (group) {
      group.times.push(time);
    } else {
      groups.push({
        ...session,
        times: [time]
      });
      delete groups[groups.length - 1].show_time;
    }

    return groups;
  }, []);
}
