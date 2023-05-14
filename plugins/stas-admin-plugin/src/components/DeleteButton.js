import { Button } from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';

const DeletePostButton = ( { postId } ) => {
	const [ isDeleted, setIsDeleted ] = useState( false );

	const deletePost = () => {
		apiFetch( {
			path: `/wp/v2/stas_product/${ postId }`,
			method: 'DELETE',
		} ).then( ( deletedPost ) => {
			console.log( 'Deleted post:', deletedPost );
			setIsDeleted( true );
		} ).catch( ( error ) => {
			console.error( 'Error deleting post:', error );
		} );
	};

	if ( isDeleted ) {
		return <p>Post deleted.</p>;
	}

	return (
		<Button isDestructive onClick={ deletePost }>
			Delete
		</Button>
	);
};

export default DeletePostButton;
