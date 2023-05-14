import { Component } from '@wordpress/element';
import apiFetch from '@wordpress/api-fetch';
import {__experimentalGrid as Grid, __experimentalText as Text, Button} from "@wordpress/components";
import DeletePostButton from "./components/DeleteButton";

class CustomPostList extends Component {
	state = {
		posts: [],
	};

	getFeaturedImageUrl(post) {
		const featuredMedia = post._embedded['wp:featuredmedia'];
		if (featuredMedia && featuredMedia.length > 0) {
			return featuredMedia[0].source_url;
		}
		return null;
	}
	async componentDidMount() {
		const posts = await apiFetch({ path: '/wp/v2/stas_product?per_page=100&_embed' });
		this.setState({ posts });
		console.log(posts)
	}

	render() {
		const { posts } = this.state;
		const { onAddNew, onEdit } = this.props;

		return (
			<div>
				<h1>Products</h1>
				<Text><Button variant="secondary" onClick={onAddNew}>Add New Product</Button></Text>
				{posts.map((post) => {
						const featuredImageUrl = this.getFeaturedImageUrl(post);
						return (
							<Grid columns={4} key={post.id}>
								<Text>{post.title.rendered}</Text>
								<Text>
									{featuredImageUrl && (
										<img
											src={featuredImageUrl}
											alt={post.title.rendered}
											style={{width: '100px', marginRight: '10px'}}
										/>
									)}
								</Text>
								<Text><Button variant="primary" onClick={() => onEdit(post.id)}>Edit</Button></Text>
								<Text><DeletePostButton postId={post.id}/></Text>
							</Grid>
							)
					})}
			</div>
		);
	}
}

export default CustomPostList;
