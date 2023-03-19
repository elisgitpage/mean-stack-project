import { Component, OnInit } from '@angular/core'
import { FormControl, FormGroup, Validators } from '@angular/forms'
import { ActivatedRoute, ParamMap } from '@angular/router'

import { Post } from '../posts.model'
import { PostsService } from '../posts.service'
import { mimeType } from './mime-type.validator';

@Component({
  selector: 'app-post-create',
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.css']
})
export class PostCreateComponent implements OnInit {
  enteredTitle = ''
  enteredContent = ''
  isLoading = false
  form: FormGroup
  imagePreview: string;
  private mode = 'create'
  private postId: string
  public post: Post

  constructor (public postsService: PostsService, public route: ActivatedRoute) {}

  ngOnInit (): void {
    this.form = new FormGroup({
      title: new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      content: new FormControl(null, { validators: [Validators.required] }),
      image: new FormControl(null, {validators: [Validators.required], asyncValidators: [mimeType]})
    })
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit'
        this.postId = paramMap.get('postId')
        this.isLoading = true
        this.postsService.getPost(this.postId).subscribe(postData => {
          this.isLoading = false
          this.post = { id: postData._id, title: postData.title, content: postData.content, image: postData.image,
          creator: postData.creator}
          this.form.setValue({
            title: this.post.title,
            content: this.post.content,
            image: this.post.image
          })
          if (typeof(this.post.image) === 'string') {
            this.imagePreview = this.post.image;
          }
        })
      } else {
        this.mode = 'create'
        this.postId = null
        this.post = { title: '', content: '', creator: null}
      }
    })
  }

  onImagePicked(event: Event) {
    const file = (event.target as HTMLInputElement).files[0];
    this.form.patchValue({image: file});
    this.form.get('image').updateValueAndValidity();
    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    }
    reader.readAsDataURL(file);
  }

  onSavePost (): void {
    if (this.form.invalid) {
      return
    }

    const post: Post = {
      title: this.form.value.title,
      content: this.form.value.content,
      image: this.form.value.image,
      creator: null
    }

    this.isLoading = true
    if (this.mode === 'create') {
      this.postsService.addPost(post)
    } else {
      post.id = this.postId
      this.postsService.updatePost(post)
    }
    this.form.reset()
  }
}
