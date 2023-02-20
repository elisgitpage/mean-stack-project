import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Post } from './posts.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPost(postId: string) {
    return this.http.get<{_id: string, title: string, content: string, image: string}>("http://localhost:3000/api/posts/" + postId);
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any, maxPosts: number }>(
        'http://localhost:3000/api/posts' + queryParams
      )
      .pipe(map(postData=> {
        return {
          posts: postData.posts.map(post=> {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            image: post.image
          };
        }),
        maxPosts: postData.maxPosts
      };
      }))
      .subscribe((updatedPostData) => {
        this.posts = updatedPostData.posts;
        this.postsUpdated.next({ posts: [...this.posts], postCount: updatedPostData.maxPosts});
      });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(post: Post) {
    const postData = new FormData();
    postData.append("title", post.title);
    postData.append("content", post.content);
    postData.append("image", post.image, post.title);


    this.http.post<{message: string, post: Post}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) => {
      const postId = responseData.post.id;
      console.log("new postId:" + responseData.post.id);
      post.id = postId;
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
  }

  updatePost(post: Post) {
    let postData;
    if(typeof(post.image) === 'object') {
      postData = new FormData();
      postData.append("id", post.id)
      postData.append("content", post.content);
      postData.append("title", post.title);
      postData.append("image", post.image, post.title);
    } else {
      postData = {
        id: post.id,
        title: post.title,
        content: post.content,
        image: post.image
      }
    }
    this.http.put("http://localhost:3000/api/posts/" + post.id, postData)
    .subscribe((response) => {
      // post.image = response.post.image;
      this.posts = this.posts.map(p => p.id === post.id ? post : p);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    })
  }

  deletePost(postId: string) {
    this.http.delete("http://localhost:3000/api/posts/" + postId)
    .subscribe(() => {
      const updatedPosts = this.posts.filter(post => post.id !== postId);
      this.posts = updatedPosts;
      this.postsUpdated.next([...this.posts]);
    })
  }
}
