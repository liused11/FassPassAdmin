import { Injectable } from '@angular/core';

export interface Video {
  id: number;
  title: string;
  category: string;
  genres: string;
  rating: number;
  image: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private videos: Video[] = [
    { id: 1, title: 'Heat', category: 'Drama', genres: 'Action, Crime, Drama', rating: 4.7, image: 'https://i.ibb.co/6nM6L5f/heat.jpg', description: 'A crime drama about professional bank robbers and the police trying to stop them.' },
    { id: 2, title: 'Batman Begins', category: 'Drama', genres: 'Action, Crime, Drama', rating: 4.8, image: 'https://i.ibb.co/vqHcbtJ/batman.jpg', description: 'The story of Bruce Wayne becoming Batman and defending Gotham.' },
    { id: 3, title: 'Leon', category: 'Drama', genres: 'Action, Crime, Drama', rating: 4.3, image: 'https://i.ibb.co/qJNw1ys/leon.jpg', description: 'A professional hitman mentors a young girl after her family is murdered.' },
    { id: 4, title: 'Matrix', category: 'Sci-Fi', genres: 'Action, Sci-Fi', rating: 4.9, image: 'https://i.ibb.co/XXmcyCG/matrix.jpg', description: 'A computer hacker learns about the true nature of reality and his role in the war against its controllers.' },
    { id: 5, title: 'Fight Club', category: 'Drama', genres: 'Drama', rating: 4.4, image: 'https://i.ibb.co/7CptjBQ/fightclub.jpg', description: 'An insomniac and a soap salesman start an underground fight club.' },
    { id: 6, title: 'Twelve Angry Men', category: 'Drama', genres: 'Crime, Drama', rating: 4.6, image: 'https://i.ibb.co/99tN0nD/12angry.jpg', description: 'A jury deliberates the fate of a teenager accused of murder.' },
    { id: 7, title: 'Saving Private Ryan', category: 'War', genres: 'Drama, War', rating: 4.4, image: 'https://i.ibb.co/pQ2mZfc/saving.jpg', description: 'A squad of soldiers searches for a missing paratrooper during WWII.' },
    { id: 8, title: 'Seven', category: 'Mystery', genres: 'Crime, Drama, Mystery', rating: 4.3, image: 'https://i.ibb.co/kGWyRmJ/seven.jpg', description: 'Two detectives hunt a serial killer who uses the seven deadly sins as his motives.' },
    { id: 9, title: 'Shutter Island', category: 'Thriller', genres: 'Mystery, Thriller', rating: 4.7, image: 'https://i.ibb.co/2gZr7BM/shutter.jpg', description: 'A U.S. Marshal investigates the disappearance of a prisoner from a mental institution.' },
    { id: 10, title: 'Basic Instinct', category: 'Thriller', genres: 'Drama, Mystery', rating: 4.3, image: 'https://i.ibb.co/LNx2C4P/basic.jpg', description: 'A detective investigates a brutal murder, where the prime suspect is a seductive novelist.' }
  ];

  getVideos() {
    return this.videos;
  }

  getVideoById(id: number) {
    return this.videos.find(v => v.id === id);
  }

  getKeepWatching() {
    // Return first 5 as 'Keep Watching'
    return this.videos.slice(0, 5);
  }

  getPopular() {
    // Return next 5 as 'Popular'
    return this.videos.slice(5, 10);
  }
}
