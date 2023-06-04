import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';

import { environment } from 'src/environments/environment';
import { Post } from './posts.model';

const BACKEND_URL = environment.apiUrl + "/posts/";

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<{posts: Post[], postCount: number}>();

  constructor(private http: HttpClient, private router: Router) {}

  getPost(postId: string) {
    return this.http.get<{_id: string, title: string, content: string, image: string, creator: string}>(BACKEND_URL + postId);
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http
      .get<{ message: string; posts: any, maxPosts: number }>(
        BACKEND_URL + queryParams
      )
      .pipe(map(postData=> {
        return {
          posts: postData.posts.map(post=> {
          return {
            title: post.title,
            content: post.content,
            id: post._id,
            image: post.image,
            creator: post.creator
          };
        }),
        maxPosts: postData.maxPosts
      };
      }))
      .subscribe((updatedPostData) => {
        console.log(updatedPostData);
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


    this.http.post<{message: string, post: Post}>(BACKEND_URL, postData)
    .subscribe((responseData) => {
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
        image: post.image,
        creator: null
      }
    }
    this.http.put(BACKEND_URL + post.id, postData)
    .subscribe((response) => {
      this.router.navigate(["/"]);
    },
    () => {
      this.router.navigate(["/"]);
    }
    )
  }

  deletePost(postId: string) {
    return this.http.delete(BACKEND_URL + postId)
  }
}
