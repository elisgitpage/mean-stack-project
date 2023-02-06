import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { Post } from './posts.model';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient, private router: Router) {}

  getPost(postId: string) {
    return this.http.get<{_id: string, title: string, content: string}>("http://localhost:3000/api/posts/" + postId);
  }

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(
        'http://localhost:3000/api/posts'
      )
      .pipe(map((postData)=> {
        return postData.posts.map(post => {
          return {
            title: post.title,
            content: post.content,
            id: post._id
          }
        })
      }))
      .subscribe((updatedPosts) => {
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
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


    this.http.post<{message: string, postId: string}>('http://localhost:3000/api/posts', postData)
    .subscribe((responseData) => {
      console.log("new postId:" + responseData.postId);
      const postId = responseData.postId;
      post.id = postId;
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
      this.router.navigate(["/"]);
    });
  }

  updatePost(post: Post) {
    this.http.put("http://localhost:3000/api/posts/" + post.id, post)
    .subscribe((response) => {
      // console.log(response);
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
